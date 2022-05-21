
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*global document,Tx,Jx,Calendar,$,Microsoft*/

(function () {
    var settings;
    var saveFlyout;
    var div;

    function convertIntoPlatformArray(array) {
        return {
            item: function(i) {
                return array[i];
            },
            count: array.length
        };
    }

    var colorTable = [{
            value: 16777215,
            name: "Red"
        }, {
            value: 65535,
            name: "Green"
        }, {
            value: 255,
            name: "Blue"
        }];

    var accounts = [
        {
            objectId:     "1",
            displayName:  "Hotmail",
            emailAddress: "colin@live.com",

            _calendarResource: {
                commit: Jx.fnEmpty
            },
            getResourceByType: function(type) {
                if (type === Microsoft.WindowsLive.Platform.ResourceType.calendar) {
                    return this._calendarResource;
                }

                return null;
            },

            calendars: [
                {
                    name: "My Calendar",
                    isDefault: true,
                    color: 65535,
                    hidden: false
                }, {
                    name: "Birthday",
                    isDefault: false,
                    color: 16777215,
                    hidden: true
                }, {
                    name: "Holiday",
                    isDefault: false,
                    color: 16777215,
                    hidden: false
                }
            ]
        }, {
            objectId:     "2",
            displayName:  "Exchange",
            emailAddress: "colin@microsoft.com",

            _calendarResource: {
                commit: Jx.fnEmpty
            },
            getResourceByType: function(type) {
                if (type === Microsoft.WindowsLive.Platform.ResourceType.calendar) {
                    return this._calendarResource;
                }

                return null;
            },

            calendars: [
                {
                    name: "Calendar",
                    isDefault: true,
                    color: 255,
                    hidden: false
                }, {
                    name: "Scroll",
                    isDefault: false,
                    color: 16777215,
                    hidden: false
                }
            ]
        }
    ];

    function mockPlatform(data) {
        data.data.platform = {
            calendarManager: {
                getAllCalendarsForAccount: function(account) {
                    return convertIntoPlatformArray(account.calendars);
                },

                colorTable: {
                    value: function(i) { return colorTable[i].value; },
                    name: function(i) { return colorTable[i].name; },
                    count: colorTable.length
                }
            },
            accountManager: {
                getConnectedAccountsByScenario: function() {
                    return convertIntoPlatformArray(accounts);
                },

                loadAccount: function(id) {
                    for (var i = 0, len = accounts.length; i < len; i++) {
                        var account = accounts[i];

                        if (account.objectId === id) {
                            return account;
                        }
                    }

                    return null;
                }
            }
        };
    }

    function mockSettings(data) {
        data.data.settings = {
            get: function (key) { return key === "alwaysShowArrows"; }
        };
    }

    function setup() {
        settings = new Calendar.Views.Settings();
        settings.on("getPlatform", mockPlatform);
        settings.on("getSettings", mockSettings);

        saveFlyout = Jx.SettingsFlyout;

        div = document.createElement("div");
        document.body.appendChild(div);

        Jx.SettingsFlyout = function () {
            return {
                getContentElement: function () {
                    return div;
                },
                show: function () { }
            };
        };
        Jx.SettingsFlyout.showHelp = function () { div.className = "showHelp"; };
        Jx.SettingsFlyout.showAbout = function () { div.className = "showAbout"; };

        // Call ActivateUI in order to set up the Platform-related variables
        settings.activateUI();
    }

    function cleanup() {
        settings.deactivateUI();
        settings = null;
        Jx.SettingsFlyout = saveFlyout;
        div.outerHTML = "";
    }

    Tx.test("SettingsTests.testOptions", function (tc) {
        tc.cleanup = cleanup;
        setup();

        var SignatureType = Microsoft.WindowsLive.Platform.SignatureType;
        accounts[0]._calendarResource.signatureType = SignatureType.enabled;
        settings._onOptions();

        /* TODO: Bug 115278: Remove signature entry points for M1.
        tc.isTrue(document.querySelector("input[data-accountId='1']").checked,  "Account 1 signature checked");
        tc.isFalse(document.querySelector("input[data-accountId='2']").checked, "Account 2 signature checked");

        document.querySelector("input[data-accountId='2']").click();
        tc.areEqual(SignatureType.enabled, accounts[1]._calendarResource.signatureType, "Account 1 signature changed");
        */

        tc.areEqual($.id("settings-color-0").value, "65535", "Wrong default color 0");
        tc.areEqual($.id("settings-color-1").value, "16777215", "Wrong default color 1");
        tc.areEqual($.id("settings-color-2").value, "16777215", "Wrong default color 2");
        tc.areEqual($.id("settings-color-3").value, "255", "Wrong default color 3");
        tc.areEqual($.id("settings-color-4").value, "16777215", "Wrong default color 4");
    });

    Tx.test("SettingsTests.testAbout", function (tc) {
        tc.cleanup = cleanup;
        setup();

        settings._onAbout();

        tc.areEqual($(".showAbout").length, 1, "About not found in DOM");
    });
})();