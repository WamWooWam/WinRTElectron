
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*global Mail,Debug,Jx,People,Microsoft*/
/*jshint browser:true*/

Jx.delayDefine(Mail, "AppSettings", function () {
    "use strict";

    var Events = {
        threadingOptionChanged: "threadingOptionChanged",
        fontSettingChanged: "fontSettingChanged"
    };

    var AppSettings = Mail.AppSettings = function () {
        this._roamingSettings = Jx.appData.roamingSettings().container("Mail");
        this._localSettings = Jx.appData.localSettings().container("Mail");
        Debug.assert(Jx.isObject(this._localSettings));
        Debug.assert(Jx.isObject(this._roamingSettings));

        // N.B.  cacheSetting is a legacy property and will cause a property to be read at startup and cached for the lifetime of the app.  This breaks roaming and multi-window features and should be
        // avoided.  Specifying a key is optional.  If not specified, the setting will be saved using its propertyName, which is adequate outside of legacy inter-op scenarios.

        [ // General Mail app settings
            { propertyName: "isThreadingEnabled",      key: "threading",           converter: booleanConverter, defaultValue: true, eventName: Events.threadingOptionChanged, cacheSetting: true },
            { propertyName: "autoMarkAsRead",          key: "auto-mark-as-read",   converter: booleanConverter, defaultValue: true,                                           cacheSetting: true },
          // First run UX
            { propertyName: "dismissedWelcomeMessage",                             converter: booleanConverter, defaultValue: false },
            { propertyName: "dismissedInboxIntro",                                 converter: booleanConverter, defaultValue: false },
            { propertyName: "dismissedNewsletterIntro",                            converter: booleanConverter, defaultValue: false },
            { propertyName: "dismissedSocialIntro",                                converter: booleanConverter, defaultValue: false },
            { propertyName: "dismissedAllFavoritesIntro",                          converter: booleanConverter, defaultValue: false },
          // Compose settings
            { propertyName: "composeFontFamily",       key: "compose-font-family", converter: stringConverter,  defaultValue: null, eventName: Events.fontSettingChanged },
            { propertyName: "composeFontSize",         key: "compose-font-size",   converter: stringConverter,  defaultValue: null, eventName: Events.fontSettingChanged },
            { propertyName: "composeFontColor",        key: "compose-font-color",  converter: stringConverter,  defaultValue: null, eventName: Events.fontSettingChanged },
          // Reading Direction Setting
            { propertyName: "readingDirection",        key: "reading-direction",   converter: enumConverter(AppSettings.Direction), defaultValue: AppSettings.Direction.auto, localSetting: true}
        ].forEach(function (def) {
            this._defineSetting(def.propertyName, def.key, def.converter, def.defaultValue, def.eventName, def.cacheSetting, def.localSetting);
        }, this);
    };
    AppSettings.Events = Events;
    Jx.augment(AppSettings, Jx.Events);
    var prototype = AppSettings.prototype;

    var booleanConverter = AppSettings.BooleanConverter = {
            toSetting: function (value) {
                Debug.assert(Jx.isBoolean(value));
                return value ? "1" : "0";
            },
            fromSetting: function (setting, defaultValue) {
                Debug.assert(Jx.isBoolean(defaultValue));
                if (defaultValue) {
                    // if the default is true, return true as long as the setting is not explicitly set as 0 or "0"
                    return setting != "0";
                } else {
                    // if the default is false, return true only when the setting is explicitly set to 1 or "1"
                    return setting == "1";
                }
            }
        },
        stringConverter = AppSettings.StringConverter = {
            toSetting: function (value) {
                Debug.assert(Jx.isString(value));
                return value;
            },
            fromSetting: function (setting, defaultValue) {
                return Jx.isNonEmptyString(setting) ? setting : defaultValue;
            }
        },
        enumConverter = AppSettings.EnumConverter = function (enumObj) {
            return {
                toSetting: function (value) {
                    Debug.assert(Jx.isObject(enumObj));
                    Debug.assert(Jx.isString(value));
                    Debug.assert(Object.keys(enumObj).filter(function (key) { return enumObj[key] === value; }).length > 0);
                    return value;
                },
                fromSetting: function (setting, defaultValue) {
                    Debug.assert(Jx.isObject(enumObj));
                    Debug.assert(Object.keys(enumObj).filter(function (key) { return enumObj[key] === defaultValue; }).length > 0);
                    Debug.assert(Jx.isNullOrUndefined(setting) || (Jx.isString(setting) && !setting) || Object.keys(enumObj).filter(function (key) { return enumObj[key] === setting; }).length > 0);
                    return Jx.isNonEmptyString(setting) ? setting : defaultValue;
                }
            };
        };

    prototype._defineSetting = function (propertyName, key, converter, defaultValue, eventName, cacheSetting, localSetting) {
        Debug.assert(Jx.isNonEmptyString(propertyName));
        Debug.assert(Jx.isNullOrUndefined(key) || Jx.isNonEmptyString(key));
        Debug.assert(Jx.isObject(converter));
        Debug.assert(Jx.isNullOrUndefined(eventName) || Jx.isNonEmptyString(eventName));
        Debug.assert(Jx.isBoolean(cacheSetting) || Jx.isNullOrUndefined(cacheSetting));
        Debug.assert(Jx.isBoolean(localSetting) || Jx.isNullOrUndefined(localSetting));
        Debug.only(eventName && Debug.Events.define(this, eventName));

        key = key || propertyName;
        var value;
        
        var setting = localSetting ? this._localSettings : this._roamingSettings;

        if (cacheSetting) {
            value = converter.fromSetting(setting.get(key), defaultValue);
        }

        Object.defineProperty(this, propertyName, {
            get: function () {
                return cacheSetting ? value : converter.fromSetting(setting.get(key), defaultValue);
            },
            set: function (newValue) {
                if (!cacheSetting || newValue !== value) {
                    value = newValue;
                    setting.set(key, converter.toSetting(newValue));
                    if (eventName) {
                        this.raiseEvent(eventName);
                    }
                }
            },
            enumerable: true
        });
    };

    Object.defineProperty(prototype, "isRetailExperience", {
        get: function () { return Jx.appData.localSettings().get("RetailExperience"); },
        enumerable: true
    });

    prototype.getLocalSettings = function () {
        return this._localSettings;
    };

    prototype.getLocalAccountSettings = function (account) {
        Debug.assert(Jx.isInstanceOf(account, Mail.Account));
        return this._localSettings.container(account.objectId);
    };

    prototype.dispose = function () {
        this._roamingSettings.dispose();
        this._localSettings.dispose();
    };

    AppSettings.openAccountUI = function (account) {
        Debug.Mail.log("AppSettings.openAccountUI", Mail.LogEvent.start);
        Debug.assert(Jx.isInstanceOf(account, Microsoft.WindowsLive.Platform.Account));
        People.Accounts.showAccountSettingsPage(Mail.Globals.platform,
            Microsoft.WindowsLive.Platform.ApplicationScenario.mail,
            People.Accounts.AccountSettingsPage.perAccountSettings,
            {
                launchedFromApp: true,
                account: account
            }
        );
        Debug.Mail.log("AppSettings.openAccountUI", Mail.LogEvent.stop);
    };

    AppSettings.Direction = {
        ltr: "ltr",
        auto: "auto",
        rtl: "rtl"
    };

});
