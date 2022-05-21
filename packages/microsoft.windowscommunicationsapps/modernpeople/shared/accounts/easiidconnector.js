
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <disable>JS2076.IdentifierIsMiscased</disable>

Jx.delayDefine(People.Accounts, "checkForEasiId", function () {

    var P = window.People,
        A = P.Accounts,
        Plat = Microsoft.WindowsLive.Platform;

    var completedProp = "completed";
    var peopleAndCalCompletedProp = "completedForPeopleAndCal";
    var connector = null;

    var checkForEasiId = A.checkForEasiId = function (platform, scenario) {
        ///<summary>If first run, checks for an Easi ID associated with the account. If found, this
        ///this will launch the AccountDialog to prompt the user for his password.</summary>
        ///<param name="platform" type="Plat.Client"/>
        ///<param name="scenario" type="Plat.ApplicationScenario"/>

        var defaultAccount = platform.accountManager.defaultAccount;

        // Get or create our package-specific settings container.
        var settingsContainer = (new Jx.AppData()).localSettings().container(defaultAccount.emailAddress).container("EasIdFirstRunFlow");

        // Check to see if the first-run check and flow have already been completed.
        if (!settingsContainer.get(completedProp)) {
            // If the account type is IMAP, and People or Calendar have run before, but not Mail, we'll mark
            // that People and Calendar specifically do not need to re-run the easi id connection flow.
            if ((scenario === Plat.ApplicationScenario.people || scenario === Plat.ApplicationScenario.calendar) &&
                settingsContainer.get(peopleAndCalCompletedProp)) {
                return;
            }
            connector = new EasiIdConnector(platform, defaultAccount, settingsContainer, scenario);
            connector.run();
        }
    };

    var EasiIdConnector = function (platform, defaultAccount, settingsContainer, scenario) {
        ///<summary>Workhorse for the A.checkForEasiId function</summary>
        ///<param name="platform" type="Plat.Client"/>
        ///<param name="defaultAccount" type="Plat.Account"/>
        ///<param name="settingsContainer" type="Jx.AppDataContainer"/>
        ///<param name="scenario" type="Plat.ApplicationScenario"/>
        Debug.assert(!Jx.isNullOrUndefined(platform));

        this._platform = platform;
        this._account = defaultAccount;
        this._settingsContainer = settingsContainer;
        this._accountChangedListener = this._checkForEasiId.bind(this);
        this._scenario = scenario;
    };

    EasiIdConnector.prototype.run = function () {
        ///<summary>Starts the EasID check and connection process</summary>
        Jx.log.info("People.Accounts.EasiIdConnector.run");
        this._account.addEventListener("changed", this._accountChangedListener);
        this._checkForEasiId();
    };

    EasiIdConnector.prototype._checkForEasiId = function () {
        ///<summary>Checks if the current account has an EasiID</summary>
        Jx.log.info("People.Accounts.EasiIdConnector._checkForEasiId");
        var account = this._account;

        // Once mailScenarioState is no longer 'unknown', stop listening for changes.
        if (account.mailScenarioState !== Plat.ScenarioState.unknown) {
            Jx.log.info("People.Accounts.EasiIdConnector._checkForEasiId, mailScenarioState=" + account.mailScenarioState);

            account.removeEventListener("changed", this._accountChangedListener);

            if (account.isEasi) {
                var resource = account.getResourceByType(Plat.ResourceType.accounts);
                if (!Jx.isNullOrUndefined(resource)) {
                    Debug.assert(Jx.isNullOrUndefined(this._resourceChangedListener));
                    var changeListener = this._resourceChangedListener = this._checkSyncStatus.bind(this, resource);
                    resource.addEventListener("changed", changeListener);
                    this._checkSyncStatus(resource);
                }
            } else {
                this._markCompleted();
            }

            NoShip.People.etw("accountsReplicationComplete");
        }
    };

    EasiIdConnector.prototype._checkSyncStatus = function (resource) {
        ///<summary>Checks that sync is completed for the 'accounts' resource.
        ///And then launches the AccountDialog once it is.</summary>
        ///<param name="resource" type="Plat.AccountResource"/>
        Jx.log.info("People.Accounts.EasiIdConnector._checkSyncStatus");

        if (resource.isInitialSyncFinished) {
            resource.removeEventListener("changed", this._resourceChangedListener);
            var account = this._account;
            var upsell = null;
            var dialogMode = A.AccountDialogMode.easiID;

            // Since the secondary account we're about to create might have been roamed already,
            // we need to search for it in the list of connected account.
            var connectedAccounts = this._platform.accountManager.getConnectedAccountsByScenario(Plat.ApplicationScenario.mail, Plat.ConnectedFilter.normal, Plat.AccountSort.name);
            for (var i = 0, count = connectedAccounts.count; i < count; i++) {
                var connectedAccount = connectedAccounts.item(i);
                if ((!connectedAccount.isDefault) &&
                    (connectedAccount.emailAddress === account.emailAddress)) {
                    // We found a matching secondary account. Check to see if it needs credentials
                    if (connectedAccount.lastAuthResult === Plat.Result.credentialMissing) {
                        upsell = connectedAccount;
                        this._launchAddAccountDialog(upsell, A.AccountDialogMode.update);
                    } else {
                        // The account is already connected, nothing to do.
                        this._markCompleted();
                        return;
                    }
                    break;
                }
            }

            if (!upsell) {
                // Lookup connectable account
                upsell = this._platform.accountManager.getConnectableAccountByEmailDomain("", account.emailAddress);
                if (Jx.isNullOrUndefined(upsell)) {
                    if (this._scenario === Plat.ApplicationScenario.mail) {
                        // Prompt user for account type (EAS, IMAP)
                        this._showChooseAccountTypeDialog(account);
                    } else {
                        // Ask the user if this is an EAS account. If not, nothing to do here.
                        this._showVerifyEasDialog(account);
                    }
                } else {
                    if (upsell.accountType === Plat.AccountType.popAccountFactory) {
                        // POP is not supported. Present dialog indicating so.
                        if (this._scenario === Plat.ApplicationScenario.mail) {
                            this._showPopNotSupportedDialog();
                        } else {
                            this._markCompleted(peopleAndCalCompletedProp);
                            return;
                        }
                    } else {
                        // This is a Google upsell, we have some special logic to make sure the correct upsell type is used.
                        var otherSupportedUpsells = upsell.getOtherConnectableAccounts(Plat.ApplicationScenario.mail);
                        if (otherSupportedUpsells && otherSupportedUpsells.count > 0) {
                            // If we're in Mail and the upsell is not an IMAP upsell, convert it to one.
                            if (this._scenario === Plat.ApplicationScenario.mail && upsell.accountType !== Plat.AccountType.imapAccountFactory) {
                                upsell = convertUpsell(otherSupportedUpsells, Plat.AccountType.imapAccountFactory) || upsell;
                            } else if (this._scenario !== Plat.ApplicationScenario.mail && upsell.accountType !== Plat.AccountType.easAccountFactory) {
                                // If we're non it Mail (i.e. People or Calendar) and this is not an EAS upsell, convert it to one.
                                upsell = convertUpsell(otherSupportedUpsells, Plat.AccountType.easAccountFactory) || upsell;
                            }
                        } else if (upsell.accountType === Plat.AccountType.imapAccountFactory && this._scenario !== Plat.ApplicationScenario.mail) {
                            this._markCompleted(peopleAndCalCompletedProp);
                            return;
                        }

                        this._launchAddAccountDialog(upsell, A.AccountDialogMode.easiID, account.emailAddress);
                    }
                }
            }
        }
    };

    EasiIdConnector.prototype._showChooseAccountTypeDialog = function (upsell) {
        var barricadeDialog = new A.AccountBarricadeDialog(upsell, function () { this._markCompleted(); } .bind(this) /*onCancelled*/);

        barricadeDialog.showChooseAccountTypeDialog(function (accountType) {
            var sourceId = "";
            switch (accountType) {
                case Plat.AccountType.easAccountFactory:
                    sourceId = "EXCH";
                    // FALLTHROUGH
                case Plat.AccountType.imapAccountFactory:
                    upsell = this._platform.accountManager.getAccountBySourceId(Jx.isNonEmptyString(sourceId) ? sourceId : "IMAP", "");
                    this._launchAddAccountDialog(upsell, A.AccountDialogMode.easiID, this._account.emailAddress);
                    break;
            }
        } .bind(this));
    };

    EasiIdConnector.prototype._showVerifyEasDialog = function (upsell) {
        var barricadeDialog = new A.AccountBarricadeDialog(upsell, function () { this._markCompleted(peopleAndCalCompletedProp); } .bind(this) /*onCancelled*/);

        barricadeDialog.showIsEasDialog(function () {
            upsell = this._platform.accountManager.getAccountBySourceId("EXCH", "");
            this._launchAddAccountDialog(upsell, A.AccountDialogMode.easiID, this._account.emailAddress);
        } .bind(this) /*onYes*/,
        function () {
            this._markCompleted(peopleAndCalCompletedProp);
        } .bind(this)/*onNo*/);
    };

    EasiIdConnector.prototype._showPopNotSupportedDialog = function () {
        var barricadeDialog = new A.AccountBarricadeDialog(this._account, function () { this._markCompleted(); } .bind(this) /*onCancelled*/);
        barricadeDialog.showPopNotSupportedDialog(P.Bici.EntryPoint.easiFlow, this._account.emailAddress);
    };

    EasiIdConnector.prototype._launchAddAccountDialog = function (upsell, dialogMode, emailAddress) {
        var dlg = new A.AccountDialog(upsell, dialogMode, this._scenario, this._platform, P.Bici.EntryPoint.easiFlow, emailAddress);
        var onDlgClosed = function () {
            this._markCompleted();
            Jx.EventManager.removeListener(Jx.root, P.DialogEvents.closed, onDlgClosed, this);
        };
        Jx.EventManager.addListener(Jx.root, P.DialogEvents.closed, onDlgClosed, this);
        dlg.show();
    };

    EasiIdConnector.prototype._markCompleted = function (prop) {
        // Mark the EasId flow as complete.
        prop = prop || completedProp;
        this._settingsContainer.set(prop, true);
    };

    function convertUpsell(otherSupportedUpsells, desiredType) {
        // Attempts to convert the given upsell to another type (e.g. EAS or IMAP)
        for (var i = 0; i < otherSupportedUpsells.count; i++) {
            var candidateUpsell = otherSupportedUpsells.item(i);
            if (candidateUpsell && candidateUpsell.accountType === desiredType) {
                // EAS upsell found.
                return candidateUpsell;
            }
        }

        return null;
    }
});
