
// Copyright (C) Microsoft Corporation.  All rights reserved.

/*global Tx,Jx,People,Mocks,Microsoft,document,window,Include*/

Include.initializeFileScope(function () {

    var M = Mocks;
    var Plat = Microsoft.WindowsLive.Platform;
    var A = People.Accounts;

    var _platform = null;
    var _asc = null;
    var divRoot = null;

    function setup() {
        divRoot = document.createElement("div");
        divRoot.style.visibility = "hidden";
        document.body.appendChild(divRoot);

        Jx.addStyle(".hidden { display: none; }")

        _platform = new Mocks.Microsoft.WindowsLive.Platform.Data.JsonProvider({
            "Account": {
                'default': [
                { objectId: "defaultAccount00", sourceId: "ABCH", isDefault: true, mock$configureType: Plat.ConfigureType.editOnClient, meContact: { calculatedUIName: "Unit Test", firstName: "Unit", lastName: "Test" }, displayName: "My Hotmail", emailAddress: "unit-test@outlook.com", canDelete: false, syncType: Plat.SyncType.push, mock$easSettings: { mock$isOofSupported: true }, peopleScenarioState: Plat.ScenarioState.connected, mailScenarioState: Plat.ScenarioState.connected, calendarScenarioState: Plat.ScenarioState.connected, authType: Plat.AccountAuthType.liveId, mock$resources: [{ resourceType: Plat.ResourceType.calendar, canEdit: false }, { resourceType: Plat.ResourceType.contacts, canEdit: false }] }
                ], 'connected': [
                    "defaultAccount00",
                    { objectId: "exch1", displayName: "Exchange", emailAddress: "actdlg-unittest@exchange.com", mock$configureType: Plat.ConfigureType.editOnClient, canDelete: true, mock$easSettings: { supportsAdvancedProperties: true, mock$isOofSupported: true }, accountType: Plat.AccountType.eas, peopleScenarioState: Plat.ScenarioState.connected, mailScenarioState: Plat.ScenarioState.connected, calendarScenarioState: Plat.ScenarioState.connected, syncType: Plat.SyncType.poll, pollInterval: 30, authType: Plat.AccountAuthType.password },
                    { objectId: "fb1", displayName: "Facebook", sourceId: "FB", userDisplayName: "Unit Test", meContact: { calculatedUIName: "Unit Test", verbs: [{ verbType: Plat.VerbType.profile, url: "http://facebook.com" }] }, mock$configureType: Plat.ConfigureType.editOnWeb, canDelete: true, accountType: Plat.AccountType.withoutPlugins, peopleScenarioState: Plat.ScenarioState.connected, authType: Plat.AccountAuthType.none, mock$resources: [{ resourceType: Plat.ResourceType.mail, mock$makeNull: true }, { resourceType: Plat.ResourceType.calendar, mock$makeNull: true }, { resourceType: Plat.ResourceType.contacts, mock$makeNull: true }] },
                    { objectId: "goog1", displayName: "Gmail", emailAddress: "actdlg-unittest@gmail.com", mock$configureType: Plat.ConfigureType.editOnClient, canDelete: true, mock$imapSettings: { supportsAdvancedProperties: true, server: "imap.gmail.com", port: 993 }, mock$smtpSettings: { server: "smtp.gmail.com", port: 465 }, accountType: Plat.AccountType.imap, mailScenarioState: Plat.ScenarioState.connected, syncType: Plat.SyncType.poll, pollInterval: 15, authType: Plat.AccountAuthType.oAuth, mock$resources: [{ resourceType: Plat.ResourceType.calendar, canEdit: false }, { resourceType: Plat.ResourceType.contacts, canEdit: false }] },
                    { objectId: "hot1", displayName: "Hotmail", emailAddress: "actdlg-unittest@hotmail.com", mock$configureType: Plat.ConfigureType.editOnClient, canDelete: true, accountType: Plat.AccountType.liveId, peopleScenarioState: Plat.ScenarioState.connected, mailScenarioState: Plat.ScenarioState.connected, calendarScenarioState: Plat.ScenarioState.connected, authType: Plat.AccountAuthType.password },
                    { objectId: "yahoo1", displayName: "Yahoo!", emailAddress: "actdlg-unittest@yahoo.com", mock$configureType: Plat.ConfigureType.editOnClient, canDelete: true, mock$imapSettings: { supportsAdvancedProperties: true, server: "imap.yahoo.com", port: 993 }, mock$smtpSettings: { server: "smtp.yahoo.com", port: 465, usesMailCredentials: false }, accountType: Plat.AccountType.imap, mailScenarioState: Plat.ScenarioState.connected, syncType: Plat.SyncType.push, authType: Plat.AccountAuthType.password, mock$resources: [{ resourceType: Plat.ResourceType.calendar, canEdit: false }, { resourceType: Plat.ResourceType.contacts, canEdit: false }] },
                ]
            },
            "MailView": {
                "ensureMailView_3000_defaultAccount00_": [
                    {
                        objectId: "***NewsLetters***",
                        accountId: "defaultAccount00",
                        type: Plat.MailViewType.newsletter,
                        isEnabled: true,
                    }
                ],
                "ensureMailView_3100_defaultAccount00_": [
                    {
                        objectId: "***Social***",
                        accountId: "defaultAccount00",
                        type: Plat.MailViewType.social,
                        isEnabled: true,
                    }
                ]
            },
        }).getClient();
    }

    function cleanup() {
        if (divRoot !== null) {
            document.body.removeChild(divRoot);
            divRoot = null;
        }
    }

    function getAccount(objectId) {
        return _platform.mock$provider.getObjectById(objectId);
    }

    function createControl(account, scenario) {
        _asc = new A.PerAccountSettingsPage(_platform, account, scenario || Plat.ApplicationScenario.mail, null, false /*delayFocusSetting*/);
        _asc._isPackageOnLockScreen = function () { return true; }
        _asc.initUI(divRoot);

        return _asc;
    }

    function selectOptionByValue(id, value) {
        var options = document.getElementById(id).options;
        for (var i = 0; i < options.length; i++) {
            if (options.item(i).value === value) {
                options.item(i).selected = true;
                break;
            }
        }
    }

    function isControlVisible(control) {
        return (control.offsetWidth !== 0 && control.offsetHeight !== 0);
    }

    function injectSettingsValues(values) {
        if (Jx.isString(values.accountName)) { document.getElementById("pasAccountName").value = values.accountName; }
        if (Jx.isString(values.userDisplayName)) { document.getElementById("pasUserDisplayName").value = values.userDisplayName; }
        if (Jx.isValidNumber(values.syncInterval)) { selectOptionByValue("pasSyncInterval", String(values.syncInterval)); }
        if (Jx.isValidNumber(values.syncWindow)) { selectOptionByValue("pasSyncWindow", String(values.syncWindow)); }
        if (Jx.isBoolean(values.syncEmail)) { document.getElementById("pasContentTypeEmail").checked = values.syncEmail; }
        if (Jx.isBoolean(values.syncContacts)) { document.getElementById("pasContentTypeContacts").checked = values.syncContacts; }
        if (Jx.isBoolean(values.syncCalendar)) { document.getElementById("pasContentTypeCalendar").checked = values.syncCalendar; }
        if (Jx.isValidNumber(values.toastState)) { selectOptionByValue("pasEnableToast", String(values.toastState)); }
        if (Jx.isBoolean(values.allowExternalImages)) { document.getElementById("pasEnableExternalImages").winControl.checked = values.allowExternalImages; }
        if (Jx.isBoolean(values.enableSignature)) { document.getElementById("pasEnableSignature").winControl.checked = values.enableSignature; }
        if (Jx.isString(values.signature)) { document.getElementById("pasSignature").value = values.signature; _asc._signatureDirty = true; }
        if (Jx.isString(values.preferredEmail)) { selectOptionByValue("pasPreferredEmail", values.preferredEmail); }
        if (Jx.isString(values.domain)) { document.getElementById("pasDomain").value = values.domain; }
        if (Jx.isString(values.userName)) { document.getElementById("pasUsername").value = values.userName; }
        if (Jx.isString(values.server)) { document.getElementById("pasServer").value = values.server; }
        if (Jx.isValidNumber(values.port)) { document.getElementById("pasImapPort").value = values.port; }
        if (Jx.isBoolean(values.useSsl)) { document.getElementById("pasUseSsl").checked = values.useSsl; }
        if (Jx.isString(values.smtpServer)) { document.getElementById("pasSmtpServer").value = values.smtpServer; }
        if (Jx.isValidNumber(values.smtpPort)) { document.getElementById("pasSmtpPort").value = values.smtpPort; }
        if (Jx.isBoolean(values.smtpUseSsl)) { document.getElementById("pasSmtpUseSsl").checked = values.smtpUseSsl; }
        if (Jx.isBoolean(values.smtpRequiresAuth)) { document.getElementById("pasSmtpRequiresAuth").checked = values.smtpRequiresAuth; }
        if (Jx.isBoolean(values.reuseCreds)) { document.getElementById("pasSmtpReuseCreds").checked = values.reuseCreds; }
        if (Jx.isString(values.smtpUserName)) { document.getElementById("pasSmtpUsername").value = values.smtpUserName; }
    }

    function verifyDisplayedSettings(tc, account) {
        tc.areEqual(document.getElementById("pasAccountName").value, account.displayName);
        var syncInterval = document.getElementById("pasSyncInterval");
        if (isControlVisible(syncInterval)) {
            tc.isTrue((syncInterval.value === String(account.syncType)) || (syncInterval.value === String(account.pollInterval)));
        }

        var mail = account.getResourceByType(Plat.ResourceType.mail);
        if (mail && mail.canEdit) {
            tc.areEqual(document.getElementById("pasSyncWindow").value, String(mail.syncWindowSize));
            tc.areEqual(document.getElementById("pasContentTypeEmail").checked, mail.isEnabled);
            tc.areEqual(document.getElementById("pasSignature").value, mail.signatureText);
            tc.areEqual(document.getElementById("pasEnableSignature").winControl.checked, mail.signatureType !== Plat.SignatureType.disabled);
        }

        var calendar = account.getResourceByType(Plat.ResourceType.calendar);
        if (calendar && calendar.canEdit) {
            tc.areEqual(document.getElementById("pasContentTypeCalendar").checked, calendar.isEnabled);
        }

        var people = account.getResourceByType(Plat.ResourceType.people);
        if (people && calendar.canEdit) {
            tc.areEqual(document.getElementById("pasContentTypeContacts").checked, people.isEnabled);
        }

        var settings = account.getServerByType(Plat.ServerType.eas) || account.getServerByType(Plat.ServerType.imap);
        if (settings) {
            tc.areEqual(document.getElementById("pasUsername").value, settings.userId);
            tc.areEqual(document.getElementById("pasDomain").value, settings.domain);
            tc.areEqual(document.getElementById("pasServer").value, settings.server);
            tc.areEqual(document.getElementById("pasImapPort").value, String(settings.port));
            tc.areEqual(document.getElementById("pasSmtpUseSsl").checked, settings.useSsl);
        }

        var removeBtn = document.getElementById("pasRemoveBtn");
        tc.isTrue((removeBtn.disabled && !account.canDelete) || (!removeBtn.disabled && account.canDelete));
    }

    Tx.test("peraccountSettingsTests.testInitAndShowPeraccountSettings", function (tc) {
        tc.cleanup = cleanup;
        setup();

        var asc = createControl(getAccount("defaultAccount00"));
        tc.isNotNullOrUndefined(asc);
    });

    Tx.test("peraccountSettingsTests.verifySettingsForDefaultAccount", function (tc) {
        runVerifySettingsText(tc, "defaultAccount00");
    });

    Tx.test("peraccountSettingsTests.verifySettingsForEasAccount", function (tc) {
        runVerifySettingsText(tc, "exch1");
    });

    Tx.test("peraccountSettingsTests.verifySettingsForImapAccount", function (tc) {
        runVerifySettingsText(tc, "yahoo1");
    });

    Tx.test("peraccountSettingsTests.verifySettingsForOauthAccount", function (tc) {
        runVerifySettingsText(tc, "goog1");
    });

    Tx.test("peraccountSettingsTests.verifySettingsForPsaAccount", function (tc) {
        runVerifySettingsText(tc, "fb1");
    });

    function runVerifySettingsText(tc, accountObjectId) {
        tc.cleanup = cleanup;
        setup();

        var account = getAccount(accountObjectId);
        createControl(account);
        verifyDisplayedSettings(tc, account);
    }

    Tx.test("peraccountSettingsTests.testSettingsChangesForEasAccount", function (tc) {
        var settingPair = [
            { setting: { name: "accountName", val: "My Work Account" }, mapsTo: { property: "displayName" } },
            { setting: { name: "syncInterval", val: 60 }, mapsTo: { property: "pollInterval" }, additionalProperties: [{ name: "syncType", val: Plat.SyncType.poll }] },
            { setting: { name: "syncWindow", val: Plat.SyncWindowSize.oneWeek }, mapsTo: { property: "syncWindowSize", object: "mailResource" } },
            { setting: { name: "syncEmail", val: true }, mapsTo: { property: "isEnabled", object: "mailResource" } },
            { setting: { name: "syncContacts", val: false }, mapsTo: { property: "isEnabled", object: "contactsResource" } },
            { setting: { name: "syncCalendar", val: false }, mapsTo: { property: "isEnabled", object: "calendarResource" } },
            { setting: { name: "toastState", val: Plat.ToastState.favoritesOnly }, mapsTo: { object: "mailResource" } },
            { setting: { name: "allowExternalImages", val: true }, mapsTo: { object: "mailResource" } },
            { setting: { name: "enableSignature", val: false }, mapsTo: { property: "signatureType", val: Plat.SignatureType.disabled, object: "mailResource" } },
            { setting: { name: "domain", val: "myemaildomain" }, mapsTo: { object: "serverSettings" } },
            { setting: { name: "server", val: "some.emailserver.net" }, mapsTo: { object: "serverSettings" } },
            { setting: { name: "useSsl", val: false }, mapsTo: { object: "serverSettings" } },
        ];

        testSettingsChanges(tc, "exch1", settingPair);
    });

    Tx.test("peraccountSettingsTests.testSettingsChangesForImapAccount", function (tc) {
        var settingPair = [
            { setting: { name: "accountName", val: "My Imap Account" }, mapsTo: { property: "displayName" } },
            { setting: { name: "userDisplayName", val: "My Imap Account" }, mapsTo: { property: "userDisplayName" } },
            { setting: { name: "syncInterval", val: 0 }, mapsTo: { property: "syncType", val: Plat.SyncType.push } },
            { setting: { name: "syncWindow", val: Plat.SyncWindowSize.threeDays }, mapsTo: { property: "syncWindowSize", object: "mailResource" } },
            { setting: { name: "syncEmail", val: false }, mapsTo: { property: "isEnabled", object: "mailResource" } },
            { setting: { name: "allowExternalImages", val: false }, mapsTo: { object: "mailResource" } },
            { setting: { name: "enableSignature", val: true }, mapsTo: { property: "signatureType", val: Plat.SignatureType.enabled, object: "mailResource" } },
            { setting: { name: "signature", val: "Sent from PeopleUTs" }, mapsTo: { property: "signatureText", object: "mailResource" } },
            { setting: { name: "userName", val: "myimapusername" }, mapsTo: { property: "userId", object: "serverSettings" } },
            { setting: { name: "domain", val: "myimapdomain" }, mapsTo: { object: "serverSettings" } },
            { setting: { name: "server", val: "imap.emailserver.net" }, mapsTo: { object: "serverSettings" } },
            { setting: { name: "useSsl", val: true }, mapsTo: { object: "serverSettings" } },
            { setting: { name: "reuseCreds", val: false } },
            { setting: { name: "smtpRequiresAuth", val: true }, mapsTo: { property: "serverRequiresLogin", object: "outgoingServerSettings" } },
            { setting: { name: "smtpUserName", val: "smtpUsername" }, mapsTo: { property: "userId", object: "outgoingServerSettings" } },
            { setting: { name: "smtpServer", val: "smtp.emailserver.net" }, mapsTo: { property: "server", object: "outgoingServerSettings" } },
            { setting: { name: "smtpUseSsl", val: true }, mapsTo: { property: "useSsl", object: "outgoingServerSettings" } },
        ];

        testSettingsChanges(tc, "yahoo1", settingPair);
    });

    Tx.test("peraccountSettingsTests.testResuseCredsForImap", function (tc) {
        var account = getAccount("yahoo1");

        var settingPair = [
            { setting: { name: "reuseCreds", val: true } },
            { setting: { name: "smtpUserName", val: "smtpUsername" }, mapsTo: { property: "userId", val: "", useValue: true, object: "outgoingServerSettings" } },
        ];

        testSettingsChanges(tc, "yahoo1", settingPair);
    });

    function getObject(name, account) {
        switch (name) {
            case "mailResource":
                return account.getResourceByType(Plat.ResourceType.mail);
            case "calendarResource":
                return account.getResourceByType(Plat.ResourceType.calendar);
            case "contactsResource":
                return account.getResourceByType(Plat.ResourceType.contacts);
            case "serverSettings":
                return account.getServerByType(Plat.ServerType.eas) || account.getServerByType(Plat.ServerType.imap);
            case "outgoingServerSettings":
                return account.getServerByType(Plat.ServerType.smtp);
        };
        return null;
    }

    function testSettingsChanges(tc, accountObjectId, settingPair) {
        tc.cleanup = cleanup;
        setup();

        var account = getAccount(accountObjectId);
        var asc = createControl(account);

        var settingsValues = settingPair.reduce(function (previousValue, currentValue) {
            previousValue[currentValue.setting.name] = currentValue.setting.val;
            return previousValue;
        }, {});

        injectSettingsValues(settingsValues);

        // Force the settings page to apply the settings to the account.
        asc._applySettings();

        // Verify that the appropriate values got set on the account.
        settingPair.forEach(function (pair) {
            if (Jx.isObject(pair.mapsTo)) {
                var targetObject = getObject(pair.mapsTo.object, account) || account;
                var targetProperty = pair.mapsTo.property || pair.setting.name;
                // Note: pair.mapsTo.useValue forces us to use 'mapsTo.val' in our comparison. This
                // if for the case, for example, when the expect result is actually an empty string, null, or 0.
                var targetValue = pair.mapsTo.val || (pair.mapsTo.useValue ? pair.mapsTo.val : pair.setting.val);

                tc.areEqual(targetObject[targetProperty], targetValue);

                // If there are any additional properties associated with this, check those.
                if (pair.additionProperties) {
                    pair.additionProperties.forEach(function (property) {
                        tc.areEqual(targetObject[property.name], property.val);
                    });
                }
            }
        });
    }

    Tx.test("peraccountSettingsTests.testControlVisibilityForPsaAccount", function (tc) {
        testControlsVisibility(tc, "fb1", ["pasAccountName", "pasManageAccountLink"], true /*expectedVisible*/);
    });

    Tx.test("peraccountSettingsTests.testControlVisibilityForDefaultAccount", function (tc) {
        testControlsVisibility(tc, "defaultAccount00", [
            "pasAccountName", "pasSignature", "pasPreferredEmail", "pasSyncInterval", "pasSyncWindow",
            "pasEnableToast", "pasContentTypeEmail", "pasNewsletterView","pasSocialUpdatesView", 
            "pasEnableExternalImages", "pasEnableSignature", "pasEnableAutoreply", "pasRemoveBtn"], true /*expectedVisible*/);
    });

    Tx.test("peraccountSettingsTests.testControlVisibilityForImapAccount", function (tc) {
        testControlsVisibility(tc, "yahoo1", [
            "pasAutoreplyMessage", "pasAutoreplyMessageExternal", "pasContentTypeContacts", "pasDomain",
            "pasContentTypeCalendar", "pasNewsletterView", "pasSocialUpdatesView", "pasAutoreplyForKnownCheck",
            "pasRoamedRemoveBtn", "pasManageAccountLink", "pasEnableAutoreply"], false /*expectedVisible*/);
    });

    Tx.test("peraccountSettingsTests.testControlVisibilityForOAuthAccount", function (tc) {
        testControlsVisibility(tc, "goog1", [
            "pasAutoreplyMessage", "pasAutoreplyMessageExternal", "pasContentTypeContacts", "pasDomain",
            "pasPassword", "pasUsername", "pasSmtpUsername", "pasSmtpPassword", "pasSmtpRequiresAuth",
            "pasSmtpReuseCreds", "pasContentTypeCalendar", "pasNewsletterView", "pasSocialUpdatesView",
            "pasAutoreplyForKnownCheck", "pasRoamedRemoveBtn", "pasManageAccountLink", "pasEnableAutoreply"], false /*expectedVisible*/);
    });

    Tx.test("peraccountSettingsTests.testControlVisibilityForEasAccount", function (tc) {
        testControlsVisibility(tc, "exch1", [
            "pasAccountName", "pasSignature", "pasPreferredEmail", "pasSyncInterval", "pasSyncWindow",
            "pasEnableToast", "pasContentTypeEmail", "pasContentTypeContacts", "pasContentTypeCalendar",
            "pasPassword", "pasDomain", "pasUsername", "pasServer", "pasUseSsl", "pasEnableExternalImages",
            "pasEnableSignature", "pasEnableAutoreply","pasRemoveBtn"], true /*expectedVisible*/);
    });

    function testControlsVisibility(tc, accountObjectId, testControls, expectedVisible) {
        tc.cleanup = cleanup;
        setup();

        createControl(getAccount(accountObjectId));

        var knownControls = ["pasAccountName", "pasUserDisplayName", "pasPassword", "pasDomain", "pasUsername",
            "pasServer", "pasSmtpServer", "pasImapPort", "pasSmtpPort", "pasSmtpPassword", "pasSmtpUsername",
            "pasSignature", "pasAutoreplyMessage", "pasAutoreplyMessageExternal", "pasPreferredEmail", "pasSyncInterval", "pasSyncWindow",
            "pasEnableToast", "pasContentTypeEmail", "pasContentTypeContacts", "pasContentTypeCalendar", "pasNewsletterView",
            "pasSocialUpdatesView", "pasUseSsl", "pasSmtpUseSsl", "pasSmtpRequiresAuth", "pasSmtpReuseCreds", "pasAutoreplyForKnownCheck",
            "pasEnableExternalImages", "pasEnableSignature", "pasEnableAutoreply", "pasRemoveBtn", "pasRoamedRemoveBtn", "pasManageAccountLink"];

        testControls.forEach(function (controlId) {
            var control = document.getElementById(controlId);

            if (expectedVisible) {
                tc.isTrue(isControlVisible(control));
            } else {
                tc.isFalse(isControlVisible(control));
            }

            // Remove the visible controls from the full list of controls.
            knownControls.splice(knownControls.indexOf(controlId), 1);
        });

        knownControls.forEach(function (controlId) {
            var control = document.getElementById(controlId);
            // If the test controls were expected to be visible,
            // the remaining should be hidden, and vice-versa.
            if (expectedVisible) {
                tc.isFalse(isControlVisible(control));
            } else {
                tc.isTrue(isControlVisible(control));
            }
        });
    }
});