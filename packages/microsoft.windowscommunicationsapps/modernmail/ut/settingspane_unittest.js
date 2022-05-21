
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*jshint browser:true*/
/*global Mail,Jx,Tx,Debug*/

(function () {

    var testInfo = { owner: "tonypan", priority: 0 };
    var oldSasManager = null;
    var oldGetCommandCtor = null;
    var oldMessageListSettings = null;
    var oldFontSettings = null;
    var oldReadingDirectionSetting = null;
    var oldJxSettingsFlyout = null;
    var sandbox = null;
    var createdMockObjects = [];
    var settingsPane = null;

    var MockWinRTSettingsPane = function () {};
    Jx.augment(MockWinRTSettingsPane, Jx.Events);
    Debug.Events.define(MockWinRTSettingsPane.prototype, "commandsrequested");

    MockWinRTSettingsPane.prototype.requestCommand = function () {
        var retrievedCommands = [];
        retrievedCommands.append = retrievedCommands.push;
        this.raiseEvent("commandsrequested", { request: { applicationCommands: retrievedCommands } });
        return retrievedCommands;
    };

    var MockWinRTSettingsCommand = function (command, label, handler) {
        this._handler = handler;
    };

    MockWinRTSettingsCommand.prototype.invoke = function () {
        this._handler.call();
    };

    var MockSettingsProvider = function () {
        this._populated = false;
        this._updated = false;
        createdMockObjects.push(this);
    };

    MockSettingsProvider.prototype = {
        dispose: Jx.fnEmpty,
        getHTML: function () { return "HTML"; },
        populateControls: function () { this._populated = true; },
        update: function () { this._updated = true; },
        verify: function () { return this._populated && this._updated; }
    };

    var MockJxSettingsFlyout = function () {
        this._isShown = false;
        createdMockObjects.push(this);
    };

    MockJxSettingsFlyout.prototype = {
        getContentElement: function () { return sandbox; },
        show: function () { this._isShown = true; },
        verify: function () { return this._isShown; }
    };

    function setup (tc) {
        settingsPane = new Mail.CompSettingsPane();

        Mail.UnitTest.stubJx(tc, "res");

        oldSasManager = window.SasManager;
        window.SasManager = null;

        oldGetCommandCtor = Mail.CompSettingsPane.prototype._getCommandCtor;
        Mail.CompSettingsPane.prototype._getCommandCtor = function () { return MockWinRTSettingsCommand; };

        oldMessageListSettings = Mail.MessageListSettings;
        oldFontSettings = Mail.FontSettings;
        oldReadingDirectionSetting = Mail.ReadingDirectionSetting;
        Mail.MessageListSettings = Mail.FontSettings = Mail.ReadingDirectionSetting = MockSettingsProvider;

        oldJxSettingsFlyout = Jx.SettingsFlyout;
        Jx.SettingsFlyout = MockJxSettingsFlyout;

        sandbox = document.createElement("div");

        createdMockObjects = [];

        tc.addCleanup(function () {
            Mail.UnitTest.restoreJx();
            window.SasManager = oldSasManager;
            Mail.CompSettingsPane.prototype._getCommandCtor = oldGetCommandCtor;
            Mail.MessageListSettings = oldMessageListSettings;
            Mail.FontSettings = oldFontSettings;
            Jx.SettingsFlyout = oldJxSettingsFlyout;
            sandbox = null;

            createdMockObjects.forEach(function (object) { tc.isTrue(object.verify()); });
            createdMockObjects = [];

            settingsPane.deactivateUI();
            settingsPane = null;
        });
    }

    Tx.test("SettingsPane_UnitTest.test_Creation", testInfo, function (tc) {
        setup(tc);

        var winRTPane = new MockWinRTSettingsPane();
        settingsPane.activateUI(winRTPane);

        var commands = [];
        commands.append = commands.push;
        settingsPane.appendCommands(commands);
        tc.areEqual(commands.length, 4);

        commands = null;
        commands = winRTPane.requestCommand();
        tc.areEqual(commands.length, 4);
    });

    Tx.test("SettingsPane_UnitTest.test_AccountsHelpAndAbout", testInfo, function (tc) {
        setup(tc);

        settingsPane.activateUI(new MockWinRTSettingsPane());

        var accountsInvoked = false;
        var helpInvoked = false;
        var aboutInvoked = false;
        settingsPane._onAccounts = function () { accountsInvoked = true; };
        settingsPane._onHelp = function () { helpInvoked = true; };
        settingsPane._onAbout = function () { aboutInvoked = true; };

        var commands = [];
        commands.append = commands.push;
        settingsPane.appendCommands(commands);

        commands[0].invoke();
        tc.isTrue(accountsInvoked);

        commands[2].invoke();
        tc.isTrue(helpInvoked);

        commands[3].invoke();
        tc.isTrue(aboutInvoked);
    });

    Tx.test("SettingsPane_UnitTest.test_Options", testInfo, function (tc) {
        setup(tc);

        settingsPane.activateUI(new MockWinRTSettingsPane());

        var commands = [];
        commands.append = commands.push;
        settingsPane.appendCommands(commands);

        tc.areEqual(sandbox.innerHTML, "");
        tc.areEqual(createdMockObjects.length, 0);

        commands[1].invoke();

        tc.areEqual(sandbox.innerHTML, "HTMLHTMLHTML");
        tc.areEqual(createdMockObjects.length, 4);
    });

})();
