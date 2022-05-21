
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="Windows.UI.ApplicationSettings.js" />

Jx.delayDefine(People, "Settings", function () {

    /// <disable>JS3092.DeclarePropertiesBeforeUse</disable>
    /// <disable>JS3053.IncorrectNumberOfArguments</disable>
    /// <disable>JS3057.AvoidImplicitTypeCoercion</disable>
    /// <disable>JS2076.IdentifierIsMiscased</disable>
    var P = window.People;
    var Plat = Microsoft.WindowsLive.Platform;
    var AppSettings = Windows.UI.ApplicationSettings;
    /// <enable>JS2076.IdentifierIsMiscased</enable>

    P.Settings = /*@constructor*/function (/*@optional*/platform, /*@optional*/jobSet) {
        /// <param name="platform" type="Plat.Client" optional="true"/>
        /// <param name="jobSet" type="P.JobSet" optional="true"/>

        this._platform = platform;
        this._jobSet = jobSet;

        this.initComponent();
        $include("$(cssResources)/SettingsFlyout.css");

        this._onCommandsRequested = this._onCommandsRequested.bind(this);
        this._pane = AppSettings.SettingsPane.getForCurrentView();
        this._pane.addEventListener("commandsrequested", this._onCommandsRequested);
    };

    Jx.augment(P.Settings, Jx.Component);

    P.Settings.prototype.shutdownComponent = function () {
        this._pane.removeEventListener("commandsrequested", this._onCommandsRequested);
        this._pane = null;
    };
    P.Settings.prototype._onCommandsRequested = function (ev) {
        var cmds = ev.request.applicationCommands;
        var Command = AppSettings.SettingsCommand;
        if (this._platform) {
            cmds.append(new Command("settings.accounts", Jx.res.getString("/accountsStrings/actSettingEntryPoint"), this._onAccounts.bind(this)));
            cmds.append(new Command("settings.options", Jx.res.getString("/Jx/Options"), this._onOptions.bind(this)));
        }

        cmds.append(new Command("settings.help", Jx.res.getString("/Jx/Help"), this._onHelp.bind(this)));
        cmds.append(new Command("settings.about", Jx.res.getString("/Jx/About"), this._onAbout.bind(this)));

        if (this._platform) {
            
            if (Jx.isWWA && !("isMock" in this._platform)) {
            
                /// <disable>JS3058.DeclareVariablesBeforeUse</disable>
                if (window.SasManager && SasManager.addSettingsEntry()) {
                    var feedback = SasManager.getSettingsCommand();
                    cmds.append(feedback);
                }
                /// <enable>JS3058.DeclareVariablesBeforeUse</enable>
            
            }
            
        }
    };

    P.Settings.prototype._onAbout = function () {
        Jx.SettingsFlyout.showAbout(document.title);
    };

    P.Settings.prototype._onAccounts = function () {
        var A = P.Accounts;
        A.showAccountSettingsPage(this._platform, Plat.ApplicationScenario.people, A.AccountSettingsPage.connectedAccounts, { jobSet: this._jobSet });
    };

    P.Settings.prototype._onHelp = function () {
        Jx.help("people");
    };

    P.Settings.prototype._onOptions = function () {
        var flyout = new Jx.SettingsFlyout(Jx.res.getString("/Jx/Options")),
            host = flyout.getContentElement(),
            platform = this._platform,
            accounts = platform.accountManager.getConnectedAccountsByScenario(Plat.ApplicationScenario.people,
                                                                              Plat.ConnectedFilter.normal,
                                                                              Plat.AccountSort.name);
        host.innerHTML = getOptionsUI(accounts);

        var toggleDiv = host.querySelector("#nameSortDescription"),
            sortToggle = new WinJS.UI.ToggleSwitch(toggleDiv, {
                checked: platform.peopleManager.nameSortOrder,
                labelOn: Jx.res.getString("/strings/yes"),
                labelOff: Jx.res.getString("/strings/no")
            });
        sortToggle.addEventListener("change", function () {
            platform.peopleManager.nameSortOrder = sortToggle.checked;
            setTimeout(function () { Jx.EventManager.broadcast("personSortChanged"); }, 200);
        });

        var filters = host.querySelectorAll("input[type=checkbox]");
        Array.prototype.forEach.call(filters, function (filter) {
            filter.addEventListener("change", function (ev) {
                var account = accounts.item(filter.value);
                account.filterContactsFromView = !filter.checked;
                account.commit();
            }, false);
        });

        flyout.show();
    };

    function getOptionsUI (accounts) {
        // Always show the name sort setting
        var html = "<div class='win-settings-section'>" +
                        "<div id='nameSortTitle' class='primaryFontSemibold'>" + Jx.res.getString("/strings/nameSortTitle") + "</div>" +
                        "<div id='nameSortDescription'></div>" +
                    "</div>";

        // Show the account filter setting if there are secondary accounts that can be filtered
        var filters = [];
        for (var i = 0, len = accounts.count; i < len; i++) {
            var account = accounts.item(i);
            if (!account.isDefault) {
                var actName = Jx.escapeHtml(account.displayName);
                filters.push("<label><input id='filter-" + actName + "' type='checkbox' value='" + String(i) + "' " +
                    (account.filterContactsFromView ? ">" : "checked>") + actName + "</label>");
            }
        }

        if (filters.length > 0) {
            html += "<div class='win-settings-section'>" +
                        "<div id='accountFilterTitle' class='primaryFontSemibold'>" + Jx.res.getString("/strings/accountFilterTitle") + "</div>" +
                        "<div id='accountFilterDescription'>" + Jx.res.getString("/strings/accountFilterDescription") + "</div>" +
                        filters.join("") +
                    "</div>";
        }

        return html;
    };

});
