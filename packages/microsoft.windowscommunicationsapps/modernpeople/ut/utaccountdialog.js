
// Copyright (C) Microsoft Corporation.  All rights reserved.

/*global Tx,Jx,People,Mocks,Microsoft,document,window,Include*/

Include.initializeFileScope(function () {

    var M = Mocks;
    var Plat = Microsoft.WindowsLive.Platform;
    var A = People.Accounts;

    var _platform = null;
    var _listener = null;
    var _previousGetAppNameFromIdFn = null;
    var _dlg = null;

    var wlIcon = "http://i.microsoft.com/global/en-us/homepage/PublishingImages/thumbnails/Win7Logo_74x74.png";

    var smallIcon = function (name) {
        return "http://secure.wlxrs.com/$live.controls.images/sn/PsaSmall/" + name + ".png";
    };

    var medIcon = function (name) {
        return "http://secure.wlxrs.com/$live.controls.images/sn/PsaMedium/" + name + ".png";
    };

    function setup(options) {
        if (!Jx.app) {
            Jx.app = new Jx.Application();
        }
        _previousGetAppNameFromIdFn = Jx.getAppNameFromId;
        Jx.getAppNameFromId = Jx.fnEmpty;
        var options = options || { onCommitComplete: Jx.fnEmpty };

        var MethodHandlers = {
            "Account.commit": function (provider, account) {
                var accountType = account.accountType;
                var addingNewAccount = false;
                if (accountType === Plat.AccountType.eas) {
                    addingNewAccount = (account.mailScenarioState === Plat.ScenarioState.none &&
                                        account.peopleScenarioState === Plat.ScenarioState.none &&
                                        account.calendarScenarioState === Plat.ScenarioState.none);
                } else if (accountType === Plat.AccountType.imap) {
                    addingNewAccount = (account.mailScenarioState === Plat.ScenarioState.none);
                }

                // Simulate adding the new account.
                if (addingNewAccount) {
                    if (!options.failAdd) {
                        var connectedAccounts = provider.query("Account", "connected");
                        connectedAccounts.mock$addItem(account, connectedAccounts.count);

                        var connected = Plat.ScenarioState.connected;
                        if (accountType === Plat.AccountType.eas) {
                            account.mock$setProperties(["settingsResult", "settingsSyncTime", "calendarScenarioState", "mailScenarioState", "peopleScenarioState"],
                                                    [Plat.Result.success, Date.now() + 100, connected, connected, connected], false /*suppressNotifications*/);
                        } else if (accountType === Plat.AccountType.imap) {
                            account.mock$setProperties(["settingsResult", "settingsSyncTime", "mailScenarioState"],
                                                    [Plat.Result.success, Date.now() + 100, connected], false /*suppressNotifications*/);
                        }
                    } else {
                        account.mock$setProperties(["settingsResult", "settingsSyncTime"], [options.failError, Date.now() + 100], false /*suppressNotifications*/);
                    }

                } else {
                    // Updated existing account
                    account.mock$setProperties(["settingsResult", "settingsSyncTime"], [Plat.Result.success, Date.now() + 100], false /*suppressNotifications*/);
                }

                options.onCommitComplete(account);
            }
        };

        _platform = new Mocks.Microsoft.WindowsLive.Platform.Data.JsonProvider({
            "Account": {
                'connected': [
                    { objectId: "gmail00", displayName: "Gmail", iconSmallUrl: smallIcon("GOOGActive"), iconMediumUrl: medIcon("GOOGActive"), emailAddress: "actdlg-unittest@gmail.com", mock$configureType: Plat.ConfigureType.editOnClient, canDelete: true, mock$easSettings: { supportsAdvancedProperties: false }, accountType: Plat.AccountType.eas, peopleScenarioState: Plat.ScenarioState.connected, mailScenarioState: Plat.ScenarioState.connected, calendarScenarioState: Plat.ScenarioState.connected },
                    { objectId: "hotmail00", displayName: "Hotmail", iconSmallUrl: smallIcon("ABCHActive"), iconMediumUrl: medIcon("ABCH"), emailAddress: "actdlg-unittest@hotmail.com", mock$configureType: Plat.ConfigureType.editOnClient, canDelete: true, accountType: Plat.AccountType.liveId, peopleScenarioState: Plat.ScenarioState.connected, mailScenarioState: Plat.ScenarioState.connected, calendarScenarioState: Plat.ScenarioState.connected },
                    { objectId: "exchange00", displayName: "Exchange", iconSmallUrl: smallIcon("EXCHActive3"), iconMediumUrl: medIcon("EXCH2"), emailAddress: "actdlg-unittest@exchange.com", mock$configureType: Plat.ConfigureType.editOnClient, canDelete: true, mock$easSettings: { supportsAdvancedProperties: true }, accountType: Plat.AccountType.eas, peopleScenarioState: Plat.ScenarioState.connected, mailScenarioState: Plat.ScenarioState.connected, calendarScenarioState: Plat.ScenarioState.connected },
                ], 'connectable_2': [
                    { objectId: "upsellLIVE", displayName: "Hotmail", sourceId: "ABCH", iconSmallUrl: smallIcon("ABCHActive"), iconMediumUrl: medIcon("ABCH"), color: 4342338, mock$configureType: Plat.ConfigureType.createConnectedAccount, accountType: Plat.AccountType.easAccountFactory, mock$easSettings: { server: "m.outlook.com" } },
                    { objectId: "upsellEXCH", displayName: "Outlook", sourceId: "EXCH", iconSmallUrl: smallIcon("EXCHActive3"), iconMediumUrl: medIcon("EXCH2"), color: 2126520, mock$configureType: Plat.ConfigureType.createConnectedAccount, accountType: Plat.AccountType.easAccountFactory, mock$easSettings: { supportsAdvancedProperties: true } },
                    { objectId: "upsellGOOG", displayName: "Gmail", sourceId: "GOOG", iconSmallUrl: smallIcon("GOOGActive"), iconMediumUrl: medIcon("GOOGActive"), color: 1088324, supportsOAuth: true, mock$configureType: Plat.ConfigureType.createConnectedAccount, accountType: Plat.AccountType.imapAccountFactory, mock$imapSettings: { server: "imap.gmail.com", port: 993  }, mock$smtpSettings: { server: "smtp.gmail.com", port: 465} },
                    { objectId: "upsellIMAP", displayName: "Other Account", sourceId: "IMAP", iconSmallUrl: wlIcon, iconMediumUrl: wlIcon, color: 14737632, mock$configureType: Plat.ConfigureType.createConnectedAccount, accountType: Plat.AccountType.imapAccountFactory, mock$imapSettings: { supportsAdvancedProperties: true } },
                    { objectId: "upsellYHOO", displayName: "Yahoo!", sourceId: "YHOO", iconSmallUrl: smallIcon("YHOO"), iconMediumUrl: medIcon("YHOO"), color: 10165870, mock$configureType: Plat.ConfigureType.createConnectedAccount, accountType: Plat.AccountType.imapAccountFactory, mock$imapSettings: { server: "winmetro.imap.mail.yahoo.com", port: 993 }, mock$smtpSettings: { server: "winmetro.smtp.mail.yahoo.com", port: 465 } },
                    ]
            }
        }, MethodHandlers).getClient();
    }

    function cleanup() {
        Jx.getAppNameFromId = _previousGetAppNameFromIdFn;

        if (_dlg) {
            _dlg.close();
            _dlg = null;
        }

        if (Jx.isFunction(_listener)) {
            Jx.EventManager.removeListener(Jx.root, A.AccountDialogEvents.newAccountAdded, _listener);
            _listener = null;
        }
    }

    function getAccount(objectId) {
        return _platform.mock$provider.getObjectById(objectId);
    }

    function createControl(account, mode, scenario) {
        _dlg = new A.AccountDialog(account, mode || A.AccountDialogMode.add, scenario || Plat.ApplicationScenario.mail, _platform, People.Bici.EntryPoint.other);
        return _dlg;
    }

    function injectDialogFieldValues(values) {
        if (values.email) { document.getElementById("actdlgEmail").value = values.email; }
        if (values.pass) { document.getElementById("actdlgPassword").value = values.pass; }
        if (values.server) { document.getElementById("actdlgServer").value = values.server; }
        if (values.domain) { document.getElementById("actdlgDomain").value = values.domain;}
        if (values.username) { document.getElementById("actdlgUsername").value = values.username; }
        if (values.port) { document.getElementById("actdlgPort").value = values.port; }
        if (values.imapServer) { document.getElementById("actdlgImapServer").value = values.imapServer; }
        if (values.smtpServer) { document.getElementById("actdlgSmtpServer").value = values.smtpServer; }
        if (values.smtpPort) { document.getElementById("actdlgSmtpPort").value = values.smtpPort; }
        if (values.smtpUsername) { document.getElementById("actdlgSmtpUsername").value = values.smtpUsername; }
        if (values.smtpPass) { document.getElementById("actdlgSmtpPassword").value = values.smtpPass; }
    }

    function clickConnectButton() {
        document.getElementById("actdlgAdd").click();
    }

    Tx.test("accountDialogTests.testInitAndShowDialog", function (tc) {
        tc.cleanup = cleanup;
        setup();

        var dlg = createControl(getAccount("upsellLIVE"));

        // Verify we can show the dialog.
        tc.isTrue(dlg.show());
    });

    Tx.asyncTest("accountDialogTests.testAddHotmailAccount", function (tc) {
        runAsyncAddOrUpdateAccountTest(tc, "upsellLIVE", { email: "myHotmail@outlook.com", pass: "secret1" });
    });

    Tx.asyncTest("accountDialogTests.testAddYahooAccount", function (tc) {
        runAsyncAddOrUpdateAccountTest(tc, "upsellYHOO", { email: "myYahoo@ymail.com", pass: "secret2" });
    });

    Tx.asyncTest("accountDialogTests.testAddEASAccount", function (tc) {
        runAsyncAddOrUpdateAccountTest(tc, "upsellEXCH", { email: "myExchange@microsoft.com", pass: "secret3" });
    });

    Tx.asyncTest("accountDialogTests.testAddIMAPAccount", function (tc) {
        runAsyncAddOrUpdateAccountTest(tc, "upsellIMAP", {
            email: "myIMAP@imapEmail.com",
            pass: "secret4",
            imapServer: "imap.imapemail.com",
            smtpServer: "smtp.imapemail.com",
        });
    });

    Tx.asyncTest("accountDialogTests.testUpdateAccount", function (tc) {
        runAsyncAddOrUpdateAccountTest(tc, "exchange00", { pass: "updatedPassword" }, A.AccountDialogMode.update);
    });

    function runAsyncAddOrUpdateAccountTest(tc, accountObjectId, fieldValues, mode) {
        // Async test should call tc.stop first.  
        tc.stop();

        tc.cleanup = cleanup;
        setup();

        var dlg = createControl(getAccount(accountObjectId), mode);

        // Verify we can show the dialog.
        tc.isTrue(dlg.show());

        // Inject credentials into the dialog fields.
        injectDialogFieldValues(fieldValues);

        var addAccountHandler = _listener = function (ev) {
            tc.isNotNullOrUndefined(ev.data.account);
            if (mode === A.AccountDialogMode.add) {
                tc.areEqual(ev.data.account.emailAddress, fieldValues.email);
            } else {
                tc.areEqual(ev.data.account.emailAddress, document.getElementById("actdlgEmail").value);
            }
            tc.start();
        };

        // Hookup listener for the soon-to-be-added account.
        Jx.EventManager.addListener(Jx.root,
                                    A.AccountDialogEvents.newAccountAdded,
                                    addAccountHandler);

        // Attempt to connect the account.
        clickConnectButton();
    }

    Tx.asyncTest("accountDialogTests.testAccountEasAuthError", function (tc) {
        testAddAcountFailures(tc, "upsellEXCH", Plat.Result.e_HTTP_DENIED, Jx.res.getString("/accountsStrings/actdlgBadCredentialsError"));
    });

    Tx.asyncTest("accountDialogTests.testAccountGoogAppsError", function (tc) {
        testAddAcountFailures(tc, "upsellEXCH", Plat.Result.e_GOOGLE_APPS, Jx.res.getString("/accountsStrings/actdlgGmailEasNotSupportedError"));
    });

    Tx.asyncTest("accountDialogTests.testAccountMaxDevicesError", function (tc) {
        testAddAcountFailures(tc, "upsellEXCH", Plat.Result.e_NEXUS_STATUS_MAXIMUM_DEVICES_REACHED, Jx.res.getString("/messagebar/messageBarDeviceLimitReached"));
    });

    Tx.asyncTest("accountDialogTests.testAccountMaxDevicesError", function (tc) {
        var email = "autodiscovery@domain.com";
        var expectedText = Jx.res.loadCompoundString("/accountsStrings/actdlgAutoDiscoveryInitialFailure", email);

        testAddAcountFailures(tc, "upsellEXCH", Plat.Result.autoDiscoveryFailed, expectedText, email);
    });

    function testAddAcountFailures(tc, accountObjectId, errorCode, expectedErrorText, email) {
        // Async test should call tc.stop first.  
        tc.stop();
        tc.cleanup = cleanup;

        var onComplete = function () {
            setImmediate(function () {
                // Grab the dialog's error text.
                var statusText = document.getElementById("actdlgStatusText").innerHTML;
                // Verify that the dialog is showing the correct error message
                tc.areEqual(expectedErrorText, statusText);
                tc.start();
            });
        };

        // Signal to our mock commit handler that the add should fail with
        // the specific error code
        setup({ failAdd: true, failError: errorCode, onCommitComplete: onComplete });

        var dlg = createControl(getAccount(accountObjectId));
        tc.isTrue(dlg.show());

        // Inject credentials into the dialog fields.
        injectDialogFieldValues({ email: email || "email@domain.com", pass: "pass" });

        // Attempt to connect the account.
        clickConnectButton();
    }

    Tx.asyncTest("accountDialogTests.testAddOAuthAccount", function (tc) {
        // Async test should call tc.stop first.  
        tc.stop();

        tc.cleanup = cleanup;
        setup();

        var dlg = createControl(getAccount("upsellGOOG"));

        var prevAuthenticateOAuthFn = A.authenticateOAuthAsync;
        // Override the authenticateOAuthAsync function
        A.authenticateOAuthAsync = function (email) {
            return new WinJS.Promise(function (completeHandler, errorHandler, progressHandler) {
                setTimeout(progressHandler, 10);
                setTimeout(function () {
                    completeHandler({ emailAddress: "myGmail@gmail.com", accessToken: "at092834", refreshToken: "rt019823", accessTokenExpiry: (new Date()) });
                }, 20);
            })
        };

        // Verify we can show the dialog.
        tc.isTrue(dlg.show());

        var addAccountHandler = _listener = function (ev) {
            tc.isNotNullOrUndefined(ev.data.account);
            tc.areEqual(ev.data.account.emailAddress, "myGmail@gmail.com");
            A.authenticateOAuthAsync = prevAuthenticateOAuthFn;
            tc.start();
        };

        // Hookup listener for the soon-to-be-added account.
        Jx.EventManager.addListener(Jx.root,
                                    A.AccountDialogEvents.newAccountAdded,
                                    addAccountHandler);
    });

    Tx.asyncTest("accountDialogTests.testAddOAuthDowngrade", function (tc) {
        // Async test should call tc.stop first.  
        tc.stop();

        var onComplete = function (account) {
            // Mark the account as no longer supporting OAuth. This should
            // cause the dialog to downgrade to basic auth, exposing the email and password fields.
            account.mock$setProperty("supportsOAuth", false);

            // Let the AccoundDialog's error handler run...
            setImmediate(function () {
                //...verify that the Dialog is now setup for basic auth.
                tc.areEqual(document.getElementById("actdlgEmail").value, account.emailAddress);
                tc.isTrue(document.getElementById("actdlgPassword").className.search(/(\b|^)hidden(\b|$)/) === -1);
                A.authenticateOAuthAsync = prevAuthenticateOAuthFn;
                tc.start();
            });
        };

        tc.cleanup = cleanup;
        setup({ failAdd: true, failError: Plat.Result.ixp_E_IMAP_LOGINFAILURE, onCommitComplete: onComplete });

        var dlg = createControl(getAccount("upsellGOOG"));

        var prevAuthenticateOAuthFn = A.authenticateOAuthAsync;
        // Override the authenticateOAuthAsync function
        A.authenticateOAuthAsync = function (email) {
            return new WinJS.Promise(function (completeHandler, errorHandler, progressHandler) {
                setTimeout(progressHandler, 10);
                setTimeout(function () {
                    completeHandler({ emailAddress: "myGmail2@gmail.com", accessToken: "at092834", refreshToken: "rt019823", accessTokenExpiry: (new Date()) });
                }, 20);
            })
        };

        // Verify we can show the dialog.
        tc.isTrue(dlg.show());
    });

    Tx.test("accountDialogTests.testDialogBlockedForOAuth", function (tc) {
        tc.cleanup = cleanup;
        setup();

        var dlg1 = createControl(getAccount("upsellLIVE"));
        var dlg2 = createControl(getAccount("upsellGOOG"));

        var oauthRequested = false;
        var prevAuthenticateOAuthFn = A.authenticateOAuthAsync;

        // Override the authenticateOAuthAsync function
        A.authenticateOAuthAsync = function (email) {
            oauthRequested = true;
        };

        tc.isTrue(dlg1.show());

        // Verify we cannot show the dialog, another one is already showing.
        tc.isFalse(dlg2.show());

        // Verify we didn't try to initiate the oauth request.
        tc.isFalse(oauthRequested);

        dlg1.close();

        A.authenticateOAuthAsync = prevAuthenticateOAuthFn;
    });

    Tx.test("accountDialogTests.testDialogReservationForOAuth", function (tc) {
        tc.cleanup = cleanup;
        setup();

        var dlgOther = createControl(getAccount("upsellLIVE"));
        var dlgOAuth = createControl(getAccount("upsellGOOG"));

        var prevAuthenticateOAuthFn = A.authenticateOAuthAsync;

        // Override the authenticateOAuthAsync function
        A.authenticateOAuthAsync = function (email) {
            // At this point, in though AccountDialog.show() has been called,
            // we haven't tried to show the dialog for our OAuth acccount.
            // That doesn't happen until the WebAuthControl--what this
            // function luanches in production--returns. However,
            // our dialog should have a reservation so that no other
            // dialogs should be able to launch in the interim. 
            // Let's verify that assertion.
            return new WinJS.Promise(function (completeHandler, errorHandler, progressHandler) {
                tc.isFalse(dlgOther.show());
                tc.isTrue(dlgOAuth.show());
                errorHandler(new Error("Canceled"));
            })
        };

        dlgOther.close();

        A.authenticateOAuthAsync = prevAuthenticateOAuthFn;
    });
});