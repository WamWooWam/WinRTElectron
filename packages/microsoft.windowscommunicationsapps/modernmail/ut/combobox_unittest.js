
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*jshint browser:true*/
/*global Mail,Jx,WinJS,Tx*/

(function () {

    var sandbox, root, host, text, arrow;
    var testInfo = { owner: "tonypan", priority: 0 };
    var oldWinJSMenu;
    var menuItems = [
        {
            value: 0,
            textId: "firstItemTextId",
            tooltipId: "firstItemToolTipId"
        },
        {
            value: 1,
            textId: "secondItemTextId",
            tooltipId: "secondItemToolTipId"
        },
        {
            value: 2,
            textId: "thirdItemTextId",
            /* tooltipId missing */
        }
    ];

    function reset(comboBox) {
        if (comboBox) {
            comboBox.dispose();
        }

        host.setAttribute("aria-expanded", "false");
        host.innerHTML = "<div class='comboboxText'></div><div class='comboboxArrow'>&#x2002;&#xE015;</div>";
        text = host.querySelector(".comboboxText");
        arrow = host.querySelector(".comboboxArrow");
    }

    function setup (tc) {
        sandbox = document.createElement("div");
        document.body.appendChild(sandbox);

        root = document.createElement("div");
        root.id = "idCompApp";
        sandbox.appendChild(root);

        host = document.createElement("div");
        reset();
        root.appendChild(host);

        Mail.UnitTest.stubJx(tc, "res");
        oldWinJSMenu = WinJS.UI.Menu;

        var Menu = WinJS.UI.Menu = function (host) {
            host.appendChild(document.createElement("div"));
        };

        Menu.prototype = {
            addEventListener: function (event, handler) {
                if (event === "aftershow") {
                    this._afterShowHandler = handler;
                } else if (event === "afterhide") {
                    this._afterHideHandler = handler;
                }
            },
            removeEventListener: Jx.fnEmpty,
            show: function () { (this._afterShowHandler || Jx.fnEmpty).call(); },
            hide: function () { (this._afterHideHandler || Jx.fnEmpty).call(); },
            dispose: Jx.fnEmpty
        };

        tc.cleanup = function () {
            sandbox.removeNode(true);
            sandbox = null;
            root = null;
            host = null;
            Mail.UnitTest.restoreJx();
            WinJS.UI.Menu = oldWinJSMenu;
        };
    }

    Tx.test("ComboBox_UnitTest.test_CreationWithoutInvocation", testInfo, function (tc) {
        setup(tc);

        // Bare minimum creation
        var comboBox = new Mail.ComboBox(host, menuItems, 1);
        tc.areEqual(comboBox.value, 1);
        tc.isFalse(arrow.classList.contains("hidden"));
        tc.areEqual(text.innerText, menuItems[1].textId);
        tc.areEqual(host.title, menuItems[1].tooltipId);
        reset(comboBox);

        // No arrow for single choice
        comboBox = new Mail.ComboBox(host, [menuItems[0]], 0);
        tc.areEqual(comboBox.value, 0);
        tc.isTrue(arrow.classList.contains("hidden"));
        tc.areEqual(text.innerText, menuItems[0].textId);
        tc.areEqual(host.title, menuItems[0].tooltipId);
        reset(comboBox);

        // Handle missing tooltip id
        comboBox = new Mail.ComboBox(host, menuItems, 2);
        tc.areEqual(comboBox.value, 2);
        tc.isFalse(arrow.classList.contains("hidden"));
        tc.areEqual(text.innerText, menuItems[2].textId);
        tc.areEqual(host.title, "");

        reset(comboBox);
    });

    Tx.test("ComboBox_UnitTest.test_Mutation", testInfo, function (tc) {
        setup(tc);

        var changed = false;
        var onChanged = function () { changed = true; };

        var comboBox = new Mail.ComboBox(host, menuItems, 0);
        comboBox.addListener("changed", onChanged);

        comboBox.updateNewValue(0, true);
        tc.isFalse(changed);

        comboBox.updateNewValue(1, true);
        tc.isTrue(changed);
        tc.areEqual(text.innerText, menuItems[1].textId);
        changed = false;

        comboBox.updateNewValue(2, true);
        tc.isTrue(changed);
        tc.areEqual(text.innerText, menuItems[2].textId);
        changed = false;

        comboBox.updateNewValue(2, true);
        tc.isFalse(changed);

        comboBox.updateValue(2, true);
        tc.isTrue(changed);
        changed = false;

        comboBox.updateValue(0, false);
        tc.isFalse(changed);

        comboBox.removeListener("changed", onChanged);
        reset(comboBox);
    });

    Tx.test("ComboBox_UnitTest.test_ShowAndHide", testInfo, function (tc) {
        setup(tc);

        var comboBox = new Mail.ComboBox(host, menuItems, 2);

        tc.isFalse(host.classList.contains("hidden"));
        comboBox.hide();
        tc.isTrue(host.classList.contains("hidden"));
        comboBox.show();
        tc.isFalse(host.classList.contains("hidden"));
        comboBox.hide();
        tc.isTrue(host.classList.contains("hidden"));

        reset(comboBox);
    });

    Tx.test("ComboBox_UnitTest.test_Invocation_Click", testInfo, function (tc) {
        setup(tc);

        tc.areEqual(root.querySelectorAll(".dropdownContainer").length, 0);
        var comboBox = new Mail.ComboBox(host, menuItems, 0);
        tc.areEqual(host.getAttribute("aria-expanded"), "false");

        host.click();
        tc.areEqual(root.querySelectorAll(".dropdownContainer").length, 1);
        tc.areEqual(host.getAttribute("aria-expanded"), "true");

        host.click();
        tc.areEqual(root.querySelectorAll(".dropdownContainer").length, 1);
        tc.areEqual(host.getAttribute("aria-expanded"), "true");

        comboBox.hide();
        tc.areEqual(root.querySelectorAll(".dropdownContainer").length, 1);
        tc.areEqual(host.getAttribute("aria-expanded"), "false");

        reset(comboBox);
        tc.areEqual(root.querySelectorAll(".dropdownContainer").length, 0);
        tc.areEqual(host.getAttribute("aria-expanded"), "false");
    });

    Tx.asyncTest("ComboBox_UnitTest.test_Invocation_Narrator", testInfo, function (tc) {
        tc.stop();
        setup(tc);

        tc.areEqual(root.querySelectorAll(".dropdownContainer").length, 0);
        var comboBox = new Mail.ComboBox(host, menuItems, 0);

        var observer = Jx.observeAttribute(host, "ASYNC_MUTATION", function () {
            tc.areEqual(root.querySelectorAll(".dropdownContainer").length, 1);

            reset(comboBox);
            tc.areEqual(root.querySelectorAll(".dropdownContainer").length, 0);

            observer.disconnect();
            tc.start();
        });

        Mail.setAttribute(host, "aria-expanded", "true");
        Mail.setAttribute(host, "ASYNC_MUTATION", "go");
    });

})();
