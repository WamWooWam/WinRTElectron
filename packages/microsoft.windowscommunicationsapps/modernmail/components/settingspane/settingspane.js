
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*global Jx,Debug,Windows,Mail,SasManager,People,Microsoft*/
/*jshint browser:true*/

Jx.delayDefine(Mail, "CompSettingsPane", function () {
    "use strict";

    Mail.CompSettingsPane = function () {
        this.initComponent();
        this._optionsFlyout = null;
        this._settingsProviders = null;
        this._disposer = new Mail.Disposer();
    };
    Jx.augment(Mail.CompSettingsPane, Jx.Component);

    var proto = Mail.CompSettingsPane.prototype;

    proto._getCommandCtor = function () {
        // The unit tests override this
        return Windows.UI.ApplicationSettings.SettingsCommand;
    };

    proto.appendCommands = function (commands) {
        if (commands.length !== 0) {
            // This method can be called twice.  Once when we initialize the blank app and other another time when we initialized the real app.
            Jx.log.info("Mail.CompSettingsPane.appendCommands - ignoring since commands are already appended");
            return;
        }

        var Command = this._getCommandCtor();
        commands.append(new Command("settings.accounts", Jx.res.getString("/accountsStrings/actSettingEntryPoint"), this._onAccounts.bind(this)));
        commands.append(new Command("settings.options", Jx.res.getString("/Jx/Options"), this._onOptions.bind(this)));
        commands.append(new Command("settings.help", Jx.res.getString("/Jx/Help"), this._onHelp.bind(this)));
        commands.append(new Command("settings.about", Jx.res.getString("/Jx/About"), this._onAbout.bind(this)));

        if (!!window.SasManager && SasManager.addSettingsEntry()) {
            var feedback = SasManager.getSettingsCommand();
            commands.append(feedback);
        }
    };

    proto.activateUI = function (pane) {
        Debug.assert(Jx.isObject(pane));
        this._disposer.add(new Mail.EventHook(pane, "commandsrequested", this._onCommandsRequested, this));
    };

    proto.deactivateUI = function () {
        this._disposer.dispose();
        this._optionsFlyout = null;
        this._settingsProviders = null;
    };

    proto._onAbout = function() {
        Jx.SettingsFlyout.showAbout(document.title);
    };

    proto._onOptions = function () {
        _markStart("onOptions");

        if (!this._optionsFlyout) {
            this._optionsFlyout = new Jx.SettingsFlyout(Jx.res.getString("/Jx/Options"));
            var host = this._optionsFlyout.getContentElement();

            Debug.assert(this._settingsProviders === null);
            var settingsProviders = this._settingsProviders = [
                this._disposer.add(new Mail.MessageListSettings(host)),
                this._disposer.add(new Mail.FontSettings(host)),
                this._disposer.add(new Mail.ReadingDirectionSetting(host))
            ];

            var html = "";
            settingsProviders.forEach(function (settingsProvider) { html += settingsProvider.getHTML(); });
            host.innerHTML = html;

            settingsProviders.forEach(function (settingsProvider) { settingsProvider.populateControls(); });
        }

        this._optionsFlyout.show();
        this._settingsProviders.forEach(function (settingsProvider) { settingsProvider.update(); });

        _markStop("onOptions");
    };

    proto._onAccounts = function () {
        var Accounts = People.Accounts,
            platform = Mail.Globals.platform;
        Accounts.showAccountSettingsPage(platform, Microsoft.WindowsLive.Platform.ApplicationScenario.mail, Accounts.AccountSettingsPage.connectedAccounts);
    };

    proto._onHelp = function () {
        Jx.help("mail");
    };

    proto._onCommandsRequested = function (ev) {
        this.appendCommands(ev.request.applicationCommands);
    };

    function _markStart(s) { Jx.mark("SettingsPane." + s + ",StartTA,SettingsPane"); }
    function _markStop(s) { Jx.mark("SettingsPane." + s + ",StopTA,SettingsPane"); }

});

