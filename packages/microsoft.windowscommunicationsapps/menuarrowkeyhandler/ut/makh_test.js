
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*jshint browser:true*/
/*global MenuArrowKeyHandler, Tx, $, Jx*/

(function () {
    var menu,
        makh;
    function setUp(config, children) {
        menu = document.getElementById("makhDiv");
        menu.setAttribute("role", "menu");
        menu.setAttribute("tabindex", "0");
        menu.style.minHeight = "100px";
        menu.style.minWidth = "100px";
        menu.name = "MAKH Menu";
        
        var btn = "";
        children = children || 10;
        for (var i = 0; i < children; i++) {
            btn += '<button id="Button' + i + '" role="menuitem"></button>';
        }

        menu.innerHTML = btn;
        
        makh = new MenuArrowKeyHandler(menu, config);
        makh.activateUI();
    }
    
    function tearDown() {
        makh.dispose();
        menu.innerHTML = "";
        menu = null;
        makh = null;
    }

    function expectFocus(tc, ele, keyboard) {
        tc.areEqual(document.activeElement, ele, ele.id + " expected to be focused, but " + document.activeElement.id + " has focus");
        if (keyboard) {
            tc.isTrue(ele.classList.contains("keyboardFocused"), "A keyboard event was used to set focus, so the 'keyboardFocused' class should have been added to the element");
        } else {
            tc.isFalse(ele.classList.contains("keyboardFocused"), "The 'keyboardFocused' class should only be added to elements when a keyboard event was used to set focus");
        }
    }
    
    Tx.test("MenuArrowKeyHandler.testDefaultConfig_Right", { owner: "andrha", priority: 0}, function (tc) {
        tc.cleanup = tearDown;
        setUp();
        menu.focus();
        
        tc.log("Focusing the menu");
        expectFocus(tc, menu);
        
        tc.log("Testing 'Right' on initial focus");
        $(menu).trigger("keydown", { key: "Right" });
        expectFocus(tc, menu.firstChild, true /*keyboard*/);
    });
    
    Tx.test("MenuArrowKeyHandler.testDefaultConfig_Left", { owner: "andrha", priority: 0}, function (tc) {
        tc.cleanup = tearDown;
        setUp();
        
        menu.focus();
        
        tc.log("Testing 'Left' on initial focus");
        $(menu).trigger("keydown", { key: "Left" });
        
        expectFocus(tc, menu.lastChild, true /*keyboard*/);
    });
    
    Tx.test("MenuArrowKeyHandler.testDefaultConfig_Up", { owner: "andrha", priority: 0}, function (tc) {
        tc.cleanup = tearDown;
        setUp();
        
        menu.focus();
        
        tc.log("Testing 'Up' on initial focus");
        $(menu).trigger("keydown", { key: "Up" });
        
        var firstChild = menu.firstChild;
        expectFocus(tc, firstChild, true /*keyboard*/);
    });
    
    Tx.test("MenuArrowKeyHandler.testDefaultConfig_Down", { owner: "andrha", priority: 0}, function (tc) {
        tc.cleanup = tearDown;
        setUp();
        
        menu.focus();
        
        tc.log("Testing 'Down' on initial focus");
        $(menu).trigger("keydown", { key: "Down" });
        
        expectFocus(tc, menu.lastChild, true /*keyboard*/);
    });

    Tx.test("MenuArrowKeyHandler.testDisableDirection_Up", { owner: "andrha", priority: 0}, function (tc) {
        tc.cleanup = tearDown;

        var config = {
            enableUp: false
        };
        setUp(config);
        
        menu.focus();
        
        tc.log("Testing 'Up' on initial focus");
        $(menu).trigger("keydown", { key: "Up" });
        
        expectFocus(tc, menu);
    });

    Tx.test("MenuArrowKeyHandler.testDisableDirection_Down", { owner: "andrha", priority: 0 }, function (tc) {
        tc.cleanup = tearDown;

        var config = {
            enableDown: false
        };
        setUp(config);

        menu.focus();

        tc.log("Testing 'Down' on initial focus");
        $(menu).trigger("keydown", { key: "Down" });

        expectFocus(tc, menu);
    });

    Tx.test("MenuArrowKeyHandler.testDisableDirection_Left", { owner: "andrha", priority: 0 }, function (tc) {
        tc.cleanup = tearDown;

        var config = {
            enableLeft: false
        };
        setUp(config);

        menu.focus();

        tc.log("Testing 'Left' on initial focus");
        $(menu).trigger("keydown", { key: "Left" });

        expectFocus(tc, menu);
    });

    Tx.test("MenuArrowKeyHandler.testDisableDirection_Right", { owner: "andrha", priority: 0 }, function (tc) {
        tc.cleanup = tearDown;

        var config = {
            enableRight: false
        };
        setUp(config);

        menu.focus();

        tc.log("Testing 'Right' on initial focus");
        $(menu).trigger("keydown", { key: "Right" });

        expectFocus(tc, menu);
    });

    Tx.test("MenuArrowKeyHandler.testGrid", { owner: "andrha", priority: 0 }, function (tc) {
        tc.cleanup = tearDown;

        setUp({}, 15);

        // Make a grid that looks like this:
        // =====================
        // | 0 | 1 | 2 | 3 | 4 |
        // =====================
        // | 5 | 6 | 7 | 8 | 9 |
        // =====================
        // | 10| 11| 12| 13| 14|
        // =====================
        menu.style.msGridRows = "20px 20px 20px";
        menu.style.msGridColumns = "20px 20px 20px 20px 20px";
        menu.style.display = "-ms-grid";

        var children = menu.childNodes,
            row = 1,
            column = 1,
            child;

        for (var i = 0; i < children.length; i++) {
            child = children[i];
            child.style.msGridRow = row;
            child.style.msGridColumn = column++;

            if (column > 5) {
                row++;
                column = 1;
            }

        }

        // Focus the first child
        children[0].focus();

        // Move focus with the "Right" key to #1
        tc.log("Testing grid, starting at element 0");
        tc.log("Moving Right to element 1");
        $(menu).trigger("keydown", { key: "Right" });
        expectFocus(tc, children[1], true /*keyboard*/);

        // Move focus to #6 with "Down"
        tc.log("Moving Down to element 6");
        $(menu).trigger("keydown", { key: "Down" });
        expectFocus(tc, children[6], true /*keyboard*/);

        // Move focus to #9 with 3 key presses to the right
        $(menu).trigger("keydown", { key: "Right" });
        $(menu).trigger("keydown", { key: "Right" });
        $(menu).trigger("keydown", { key: "Right" });
        tc.log("Moving from element 6 to element 9");
        expectFocus(tc, children[9], true /*keyboard*/);

        // Check right wrap by moving to 10
        $(menu).trigger("keydown", { key: "Right" });
        tc.log("Moving from element 9 to element 10");
        expectFocus(tc, children[10], true /*keyboard*/);

        // Check that "Up" works
        tc.log("Moving Up to element 5");
        $(menu).trigger("keydown", { key: "Up" });
        expectFocus(tc, children[5], true /*keyboard*/);

        // Check left wrap works
        tc.log("Move Left to element 4");
        $(menu).trigger("keydown", { key: "Left" });
        expectFocus(tc, children[4], true /*keyboard*/);

        // Move to #0 with another key press to check wrap
        tc.log("Moving to element 0");
        children[0].focus();
        expectFocus(tc, children[0]);

        // Check that wrap works
        tc.log("Moving Left to element 14");
        $(menu).trigger("keydown", { key: "Left" });
        expectFocus(tc, children[14], true /*keyboard*/);

        // Check wrap works the other way
        $(menu).trigger("keydown", { key: "Right" });
        tc.log("Moving Right to element 0");
        expectFocus(tc, children[0], true /*keyboard*/);
    });

    Tx.test("MenuArrowKeyHandler.focusFirst", { owner: "andrha", priority: 0 }, function (tc) {
        tc.cleanup = tearDown;
        var config = {
            firstOnFocus: true
        };

        setUp(config);

        menu.focus();
        $(menu).trigger("focus");

        // Considered to be a keyboard focus event because that's most likely how you got focus on the root anyway
        expectFocus(tc, menu.firstChild, true /*keyboard*/);
    });

    Tx.test("MenuArrowKeyHandler.RTL", { owner: "andrha", priority: 0}, function (tc) {
        tc.cleanup = tearDown;
        
        // Override the Jx.isRtl() to return true so the makh will be treated like this.
        var rtl = Jx.isRtl;
        Jx.isRtl = function () {
            return true;
        };

        setUp();

        menu.focus();
        var children = menu.childNodes;
        $(menu).trigger("keydown", { key: "Right" });

        // In RTL, Right should focus the last menu item instead of the first
        expectFocus(tc, children[9], true /*keyboard*/);

        $(menu).trigger("keydown", { key: "Right" });
        expectFocus(tc, children[8], true /*keyboard*/);

        $(menu).trigger("keydown", { key: "Left" });
        expectFocus(tc, children[9], true /*keyboard*/);

        $(menu).trigger("keydown", { key: "Left" });
        expectFocus(tc, children[0], true /*keyboard*/);

        $(menu).trigger("keydown", { key: "Left" });
        expectFocus(tc, children[1], true /*keyboard*/);

        // Restore the previous function
        Jx.isRtl = rtl;
    });

    Tx.test("MenuArrowKeyHandler.pushElement", { owner: "mholden", priority: 0 }, function (tc) {
        tc.cleanup = tearDown;
        var config = {
            firstOnFocus: true
        };
        setUp(config);

        // Reset the handler
        makh.reset();

        // Create an element with no id and add it to the handler
        var firstElement = document.createElement("div");
        menu.appendChild(firstElement);
        makh.pushElement(firstElement);

        // Verify the firstElement is selected on focus
        menu.focus();
        $(menu).trigger("focus");
        expectFocus(tc, firstElement, true /*keyboard*/);

        // Create another element and add it to the handler
        var secondElement = document.createElement("div");
        menu.appendChild(secondElement);
        makh.pushElement(secondElement);

        // Verify second element is selected after right arrow key press
        $(menu).trigger("keydown", { key: "Right" });
        expectFocus(tc, secondElement, true /*keyboard*/);
    });

})();
