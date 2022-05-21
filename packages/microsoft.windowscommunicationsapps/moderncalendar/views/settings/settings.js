
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\common\Common.js" />

/*jshint browser:true*/
/*global document,WinJS,Windows,Microsoft,People,Jx,Calendar,SasManager*/

Jx.delayDefine(Calendar.Views, "Settings", function () {

    //
    // Namespaces
    //

    var AppSettings = Windows.UI.ApplicationSettings,
        Helpers     = Calendar.Helpers;

    var Platform,
        ResourceType,
        SignatureType;

    //
    // Constants
    //

    var grayHiddenColor       = 9211020;

    //
    // Settings
    //

    var Settings = Calendar.Views.Settings = function () {
        this.initComponent();

        this._onCommandsRequested      = this._onCommandsRequested.bind(this);
        this._onSignatureOptionChanged = this._onSignatureOptionChanged.bind(this);
    };

    Jx.augment(Settings, Jx.Component);

    //
    // Public
    //

    Settings.prototype.appendCommands = function(cmds) {
        var Command = AppSettings.SettingsCommand;

        cmds.append(new Command("settings.accounts", Jx.res.getString("/accountsStrings/actSettingEntryPoint"), this._onAccounts.bind(this)));
        cmds.append(new Command("settings.options",  Jx.res.getString("/Jx/Options"),                           this._onOptions.bind(this)));
        cmds.append(new Command("settings.help",     Jx.res.getString("/Jx/Help"),                              this._onHelp.bind(this)));
        cmds.append(new Command("settings.about",    Jx.res.getString("/Jx/About"),                             this._onAbout.bind(this)));

        if (!!window.SasManager && SasManager.addSettingsEntry()) {
            var feedback = SasManager.getSettingsCommand();
            cmds.append(feedback);
        }
    };

    //
    // Jx.Component
    //

    Settings.prototype.activateUI = function() {
        if (!Platform) {
            Platform      = Microsoft.WindowsLive.Platform;
            ResourceType  = Platform.ResourceType;
            SignatureType = Platform.SignatureType;
        }

        var pane = AppSettings.SettingsPane.getForCurrentView();
        pane.addEventListener("commandsrequested", this._onCommandsRequested);
    };

    Settings.prototype.deactivateUI = function() {
        var pane = AppSettings.SettingsPane.getForCurrentView();
        pane.removeEventListener("commandsrequested", this._onCommandsRequested);
    };

    //
    // Private
    //

    Settings.prototype._onCommandsRequested = function(ev) {
        this.appendCommands(ev.request.applicationCommands);
    };

    Settings.prototype._onAbout = function () {
        Jx.SettingsFlyout.showAbout(document.title);
    };

    Settings.prototype._onAccounts = function() {
        // get the platform
        var data = {};
        this.fire("getPlatform", data);

        // show the flyout
        var Accounts = People.Accounts;
        Accounts.showAccountSettingsPage(data.platform,
                                         Calendar.scenario,
                                         Accounts.AccountSettingsPage.connectedAccounts);
    };

    Settings.prototype._onHelp = function () {
        Jx.help("calendar");
    };

    Settings.prototype._formatAccount = function (account) {
        var id       = account.objectId,
            resource = account.getResourceByType(ResourceType.calendar);

        return {
            id:    id,
            name:  account.displayName,
            email: account.emailAddress,

            useSignature: (resource.signatureType === SignatureType.enabled)
        };
    };

    function formatCalendar (calendar) {
        return {
            name:             calendar.name,
            isDefault:        calendar.isDefault,
            calendarPlatform: calendar // hidden, color
        };
    }

    Settings.prototype._getCalendarData = function () {
        var calendarManager = this._platform.calendarManager,
            accounts        = this._platform.accountManager.getConnectedAccountsByScenario(Calendar.scenario, Platform.ConnectedFilter.normal, Platform.AccountSort.rank),
            numAccounts     = accounts.count,
            calendars       = [];

        for (var i = 0; i < numAccounts; i++) {
            var account           = accounts.item(i),
                formatted         = this._formatAccount(account),
                platformCalendars = calendarManager.getAllCalendarsForAccount(account),
                numCalendars      = platformCalendars.count,
                accountCalendars  = [];

            for (var j = 0; j < numCalendars; j++) {
                var calendar = formatCalendar(platformCalendars.item(j));
                calendar.account = formatted;

                if (calendar.isDefault) {
                    accountCalendars.unshift(calendar);
                } else {
                    accountCalendars.push(calendar);
                }
            }

            calendars = calendars.concat(accountCalendars);
        }

        var colorTable = calendarManager.colorTable,
            numColors  = colorTable.count,
            colors     = [];

        for (var k = 0; k < numColors; k++) {
            var value = colorTable.value(k);

            colors[k] = {
                name: colorTable.name(k),
                value: value,
                hex: Helpers.processEventColor(value)
            };
        }

        return {
            calendars: calendars,
            colors: colors
        };
    };

    function onToggleHidden(calendarPlatform, select) {
        var hidden = select.disabled = !select.disabled;

        select.style.color = (hidden?grayHiddenColor:parseInt(select.value, 10));
        select.disabled = hidden;
        calendarPlatform.hidden = hidden;
        calendarPlatform.commit();
    }

    function onColorChange(calendarPlatform, select) {
        calendarPlatform.color = select.value;
        select.style.color = parseInt(select.value, 10);
        calendarPlatform.commit();
    }

    function onToggleKeyUp(toggle, onToggle, ev) {
        if (ev.keyCode === Jx.KeyCode.rightarrow) {
            if (!toggle.checked) {
                toggle.checked = true;
                onToggle();
            }
            ev.stopPropagation();
        } else if (ev.keyCode === Jx.KeyCode.leftarrow) {
            if (toggle.checked) {
                toggle.checked = false;
                onToggle();
            }
            ev.stopPropagation();
        }
    }

    Settings.prototype._onSignatureOptionChanged = function(ev) {
        var target  = ev.target,
            checked = target.checked;

        var accountId = target.getAttribute("data-accountId"),
            account   = this._platform.accountManager.loadAccount(accountId),
            resource  = account.getResourceByType(ResourceType.calendar);

        resource.signatureType = (checked ? SignatureType.enabled : SignatureType.disabled);
        resource.commit();
    };

    Settings.prototype._initializeSignatureOptions = function(host) {
        // get all the checkboxes
        var inputs = host.querySelectorAll(".signature-option input");

        for (var i = 0, len = inputs.length; i < len; i++) {
            inputs[i].addEventListener("change", this._onSignatureOptionChanged, false);
        }
    };

    Settings.prototype._initializeArrowsOption = function(host, labelOff, labelOn) {
        // get our global app settings
        var arrowsDiv    = host.querySelector(".arrowsSwitch"),
            arrowsSwitch = new WinJS.UI.ToggleSwitch(arrowsDiv, {
                title:    Jx.res.getString("AlwaysShowIterators"),
                checked:  this._settings.get("alwaysShowArrows"),
                labelOff: labelOff,
                labelOn:  labelOn
            });

        arrowsSwitch.addEventListener("change", function(ev) {
            this.fire("setShowArrows", {
                value: ev.target.winControl.checked
            });
        }.bind(this));
    };

    Settings.prototype._onOptions = function () {
        // get our platform and app settings.  we'll need them for a few things.
        var data = {};

        this.fire("getPlatform", data);
        this._platform = data.platform;

        this.fire("getSettings", data);
        this._settings = data.settings;

        var dataModel = this._getCalendarData(),
            calendars = dataModel.calendars,
            flyout    = new Jx.SettingsFlyout(Jx.res.getString("/Jx/Options")),
            host      = flyout.getContentElement();

        var hide = Jx.res.getString("Hide"),
            show = Jx.res.getString("Show");

        host.innerHTML = this._templateOptions(dataModel.calendars, dataModel.colors);

        this._initializeSignatureOptions(host);
        this._initializeArrowsOption(host, hide, show);

        for (var i = 0, len = calendars.length; i < len; i++) {
            var calendar  = calendars[i],
                calendarPlatform  = calendar.calendarPlatform,
                toggleDiv = host.querySelector("#settings-calendar-" + i),
                toggle    = new WinJS.UI.ToggleSwitch(toggleDiv, {
                    title: Jx.escapeHtml(calendar.name),
                    checked: !calendarPlatform.hidden,
                    labelOff: hide,
                    labelOn:  show
                }),
                select    = host.querySelector("#settings-color-" + i);

            toggleDiv.querySelector(".win-title").setAttribute("aria-label", calendar.name + ", " + calendar.account.email);

            var onToggle = onToggleHidden.bind(this, calendarPlatform, select);
            toggle.addEventListener("change", onToggle, false);
            toggle.addEventListener("keydown", onToggleKeyUp.bind(this, toggle, onToggle), false);

            select.addEventListener("change", onColorChange.bind(this, calendarPlatform, select), false);
            select.value = calendarPlatform.color;
            select.disabled = calendarPlatform.hidden;
            if (!calendarPlatform.hidden) {
                select.style.color = parseInt(select.value, 10);
            }
        }

        // now show the flyout
        flyout.show();
    };

    Settings.prototype._templateOptions = function (calendars, colors) {
        // Bug 115278: Remove signature entry points for M1. 
        // var signatureHtml = Jx.escapeHtml(Jx.res.getString("UseMailSignature"));
        
        var html = "";

        for (var i = 0, len = calendars.length; i < len; i++) {
            var calendar = calendars[i];

            if (calendar.isDefault) {
                var account = calendar.account;

                html += 
                    '<div class="calendar-account">' +
                    '<h3>' + Jx.escapeHtml(account.name) + '</h3>' +
                    Jx.escapeHtml(account.email) +

                    // Bug 115278: Remove signature entry points for M1.
                    //var checked = account.useSignature ? ' checked="checked"' : '';
                    // '<div class="signature-option">' +
                    //    '<label><input type="checkbox" data-accountId="' + account.id + '"' + checked + '> ' + signatureHtml + '</label>' +
                    // '</div>' +
                    '</div>';
            }
            
            html += 
                '<div id="settings-calendar-' + i + '" class="calendar-toggle"></div>' +
                '<select id="settings-color-' + i + '" class="color-table" aria-label="' + Jx.escapeHtml(calendar.name) + '">';

            for (var j = 0, lenj = colors.length; j < lenj; j++) {
                var color = colors[j];
                html += '<option value="' + color.value + '" style="color:' + color.hex + '" aria-label="' + color.name + '">&#x25A0;&#x00A0;&#x00A0;' + color.name + '</option>';
            }

            html += '</select>';
        }

        html += 
            '<div class="win-settings-section">' +
                '<div class="arrowsSwitch"></div>' +
            '</div>';

        return html;
    };

});
