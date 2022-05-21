
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*global Jx,Debug,Mail,WinJS*/
/*jshint browser:true*/

Jx.delayDefine(Mail, "MessageListSettings", function () {
    "use strict";

    Mail.MessageListSettings = function (host) {
        Debug.assert(Jx.isHTMLElement(host));

        this._host = host;
        this._toggleSwitchSettings = null;
        this._disposer = new Mail.Disposer();

        Debug.only(Object.seal(this));
    };

    var proto = Mail.MessageListSettings.prototype;

    proto.dispose = function () {
        this._disposer.dispose();
        this._disposer = null;
        this._toggleSwitchSettings = null;
        this._host = null;
    };

    proto.getHTML = function () {
        return '<div id="mailSettingsPaneMessageListOptionsHeader" class="typeSizeNormal">' +
                   escapedResource("mailSettingsPaneMessageListOptionsHeaderLabel") +
               '</div>' +
               '<div id="mailSettingsPaneMessageListThreadingOptionToggleSwitch"></div>' +
               '<div id="mailSettingsPaneMessageListThreadingIncludesSentItemsToggleSwitch"></div>' +
               '<div id="mailSettingsPaneMessageListAutoMarkAsReadToggleSwitch"></div>';
    };

    proto.populateControls = function () {
        _markStart("populateControls");

        this._initToggleSettings();
        this._toggleSwitchSettings.forEach(function (toggleSwitchSetting) {
            Debug.assert(toggleSwitchSetting.toggleSwitch === null);

            toggleSwitchSetting.toggleSwitch = new WinJS.UI.ToggleSwitch(
                this._host.querySelector(toggleSwitchSetting.host),
                {
                    checked: toggleSwitchSetting.initialState,
                    title: escapedResource(toggleSwitchSetting.titleResId),
                    labelOn: escapedResource("mailSettingsPaneOnLabel"),
                    labelOff: escapedResource("mailSettingsPaneOffLabel"),
                    disabled: !toggleSwitchSetting.enabled
                }
            );

            this._disposer.add(toggleSwitchSetting.eventHooks);
        }, this);

        _markStop("populateControls");
    };

    proto.update = Jx.fnEmpty; // No-op, for interface parity only

    proto._initToggleSettings = function () {
        Debug.assert(this._toggleSwitchSettings === null);
        this._toggleSwitchSettings = [
            new ToggleSetting(
                "#mailSettingsPaneMessageListThreadingOptionToggleSwitch",
                "mailSettingsPaneMessageListThreadingOptionDescriptionLabel",
                "isThreadingEnabled"
            ),
            new ToggleSetting(
                "#mailSettingsPaneMessageListAutoMarkAsReadToggleSwitch",
                "mailSettingsPaneMessageListAutoMarkAsReadDescriptionLabel",
                "autoMarkAsRead"
            ),
            new IncludeSentItemsToggleSetting()
        ];
    };

    var ToggleSetting = function (host, titleResId, appSettingsProperty) {
        Debug.assert(Jx.isNonEmptyString(host));
        Debug.assert(Jx.isNonEmptyString(titleResId));
        Debug.assert(Jx.isNonEmptyString(appSettingsProperty));

        this._host = host;
        this._titleResId = titleResId;
        this._appSettingsProperty = appSettingsProperty;
        this._toggleSwitch = null;
    };

    ToggleSetting.prototype = {
        get host () { return this._host; },
        get titleResId () { return this._titleResId; },
        get appSettingsProperty () { return this._appSettingsProperty; },
        get enabled () { return true; },
        get initialState () {
            return Mail.Globals.appSettings[this.appSettingsProperty];
        },
        toggledHandler: function () {
            Mail.Globals.appSettings[this.appSettingsProperty] = this.toggleSwitch.checked;
        },
        get eventHooks () {
            return [ new Mail.EventHook(this.toggleSwitch, "change", this.toggledHandler, this) ];
        },
        get toggleSwitch () { return this._toggleSwitch; },
        set toggleSwitch (toggleSwitch) { this._toggleSwitch = toggleSwitch; },
    };

    var IncludeSentItemsToggleSetting = function () {
        this._host = "#mailSettingsPaneMessageListThreadingIncludesSentItemsToggleSwitch",
        this._titleResId = "mailSettingsPaneMessageListThreadingIncludesSentItemsDescriptionLabel";
        this._toggleSwitch = null;
    };

    IncludeSentItemsToggleSetting.prototype = {
        get host () { return this._host; },
        get titleResId () { return this._titleResId; },
        get appSettingsProperty () { Debug.assert(false); },
        get enabled () {
            return Mail.Globals.appSettings.isThreadingEnabled;
        },
        get initialState () {
            return Mail.Globals.platform.mailManager.getIncludeSentItemsInConversation();
        },
        toggledHandler : function () {
            var optionValue = this.toggleSwitch.checked;
            Jx.log.info("toggleSwitchSetting.toggleSwitch.checked = " + optionValue);
            Mail.Globals.platform.mailManager.setIncludeSentItemsInConversation(optionValue);
        },
        get eventHooks () {
            return [
                new Mail.EventHook(this.toggleSwitch, "change", this.toggledHandler, this),
                new Mail.EventHook(
                    Mail.Globals.appSettings,
                    Mail.AppSettings.Events.threadingOptionChanged,
                    function () {
                        var toggleSwitch = this.toggleSwitch;
                        if (toggleSwitch) {
                            toggleSwitch.disabled = !this.enabled;
                        }
                    },
                    this
                )
            ];
        },
        get toggleSwitch () { return this._toggleSwitch; },
        set toggleSwitch (toggleSwitch) { this._toggleSwitch = toggleSwitch; },
    };

    function escapedResource(id) { return Jx.escapeHtml(Jx.res.getString(id)); }
    function _markStart(s) { Jx.mark("MessageListSettings." + s + ",StartTA,MessageListSettings"); }
    function _markStop(s) { Jx.mark("MessageListSettings." + s + ",StopTA,MessageListSettings"); }

});