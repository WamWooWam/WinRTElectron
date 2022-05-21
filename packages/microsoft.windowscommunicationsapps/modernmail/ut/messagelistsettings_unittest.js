
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*jshint browser:true*/
/*global Mail,Jx,Tx,Debug,WinJS*/

(function () {

    var testInfo = { owner: "tonypan", priority: 0 };
    var oldWinJSToggleSwitch = null;
    var includeInSent = false;
    var sandbox = null;
    var settings = null;
    var threadingToggle = null;
    var includeInSentToggle = null;
    var autoMarkAsReadToggle = null;

    var MockWinJSToggleSwitch = function (host, options) {
        this._host = host;
        this._checked = options.checked;
        this._disabled = options.disabled;
        this._host.classList.add("MockWinJSToggleSwitch");

        if (this._host.id === "mailSettingsPaneMessageListThreadingOptionToggleSwitch") {
            threadingToggle = this;
        } else if (this._host.id === "mailSettingsPaneMessageListThreadingIncludesSentItemsToggleSwitch") {
            includeInSentToggle = this;
        } else if (this._host.id === "mailSettingsPaneMessageListAutoMarkAsReadToggleSwitch") {
            autoMarkAsReadToggle = this;
        }
    };

    MockWinJSToggleSwitch.prototype = {
        get checked() { return this._checked; },
        get disabled() { return this._disabled; },
        set disabled(value) { this._disabled = value; },
        toggle: function () {
            if (!this._disabled) {
                this._checked = !this._checked;
                this.raiseEvent("change");
            }
        }
    };
    Jx.augment(MockWinJSToggleSwitch, Jx.Events);
    Debug.Events.define(MockWinJSToggleSwitch.prototype, "change");

    function setup (tc) {
        Mail.UnitTest.stubJx(tc, "res");
        Mail.UnitTest.stubJx(tc, "appData");
        Mail.UnitTest.stubJx(tc, "activation");

        Mail.UnitTest.initGlobals();
        Mail.Globals.appSettings = new Mail.AppSettings();
        Mail.Globals.platform.mailManager.getIncludeSentItemsInConversation = function () { return includeInSent; };
        Mail.Globals.platform.mailManager.setIncludeSentItemsInConversation = function (value) { includeInSent = value; };

        oldWinJSToggleSwitch = WinJS.UI.ToggleSwitch;
        WinJS.UI.ToggleSwitch = MockWinJSToggleSwitch;

        sandbox = document.createElement("div");
        settings = new Mail.MessageListSettings(sandbox);
        sandbox.innerHTML = settings.getHTML();
        settings.populateControls();
        settings.update();

        tc.addCleanup(function () {
            Mail.UnitTest.restoreJx();
            Mail.Globals.appSettings.dispose();
            Mail.Globals.appSettings = null;
            Mail.UnitTest.disposeGlobals();
            WinJS.UI.ToggleSwitch = oldWinJSToggleSwitch;
            sandbox = null;
            settings.dispose();
            settings = null;
            threadingToggle = null;
            includeInSentToggle = null;
            autoMarkAsReadToggle = null;
        });
    }

    function verifyToggleSwitches(tc) {
        tc.areEqual(sandbox.querySelectorAll(".MockWinJSToggleSwitch").length, 3);
        tc.areEqual(threadingToggle.checked, Mail.Globals.appSettings.isThreadingEnabled);
        tc.areEqual(includeInSentToggle.checked, Mail.Globals.platform.mailManager.getIncludeSentItemsInConversation());
        tc.areEqual(includeInSentToggle.disabled, !threadingToggle.checked);
        tc.areEqual(autoMarkAsReadToggle.checked, Mail.Globals.appSettings.autoMarkAsRead);
    }

    Tx.test("MessageListSettings_UnitTest.End_To_End", testInfo, function (tc) {
        setup(tc);

        tc.isTrue(Mail.Globals.appSettings.isThreadingEnabled);
        tc.isFalse(Mail.Globals.platform.mailManager.getIncludeSentItemsInConversation());
        tc.isTrue(Mail.Globals.appSettings.autoMarkAsRead);

        // Initial state
        verifyToggleSwitches(tc);

        // Turn threading off
        threadingToggle.toggle();
        tc.isFalse(Mail.Globals.appSettings.isThreadingEnabled);
        verifyToggleSwitches(tc);

        // The include-in-sent toggle should be disabled right now because threading is off
        tc.isTrue(includeInSentToggle.disabled);
        includeInSentToggle.toggle();
        tc.isFalse(Mail.Globals.platform.mailManager.getIncludeSentItemsInConversation());
        verifyToggleSwitches(tc);

        // Turn threading on
        threadingToggle.toggle();
        tc.isTrue(Mail.Globals.appSettings.isThreadingEnabled);
        verifyToggleSwitches(tc);

        // Turn on include-in-sent
        tc.isFalse(includeInSentToggle.disabled);
        includeInSentToggle.toggle();
        tc.isTrue(Mail.Globals.platform.mailManager.getIncludeSentItemsInConversation());
        verifyToggleSwitches(tc);

        // Turn off auto-mark-as-read
        autoMarkAsReadToggle.toggle();
        tc.isFalse(Mail.Globals.appSettings.autoMarkAsRead);
        verifyToggleSwitches(tc);
    });

})();
