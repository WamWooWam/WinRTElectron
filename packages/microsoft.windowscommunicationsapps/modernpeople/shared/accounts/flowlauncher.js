
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//
/// <disable>JS2076.IdentifierIsMiscased</disable>

Jx.delayDefine(People.Accounts, "FlowLauncher", function () {

    var P = window.People,
        A = P.Accounts,
        Plat = Microsoft.WindowsLive.Platform;

    var FlowLauncher = A.FlowLauncher = function (platform, scenario, biciSuffix, jobSet) {
        /// <summary>Simple helper class to augment AccountControlBase with 'add flow' logic </summary>
        /// <param name="platform" type="Plat.Client"/>
        /// <param name="scenario" type="Plat.ApplicationScenario"/>
        /// <param name="biciSuffix" type="String"/>
        /// <param name="jobSet" type="P.JobSet" optional="true"/>

        A.AccountControlBase.call(this, platform, scenario);
        this._biciSuffix = biciSuffix;
        this._jobSet = jobSet;
    };
    Jx.augment(FlowLauncher, A.AccountControlBase);

    FlowLauncher.prototype._getBiciSuffix = function () {
        return this._biciSuffix;
    };

    FlowLauncher.prototype._launchAddAccount = function (account, reconnect) {
        var biciEntryPoint = this._biciSuffix === "canvas" ? P.Bici.EntryPoint.canvas : P.Bici.EntryPoint.accountSettings;
        var scenario = this._scenario;
        var platform = this._platform;
        var launchAccountDialog = function (upsell) {
            var dlg = new A.AccountDialog(upsell, A.AccountDialogMode.add, scenario, platform, biciEntryPoint);
            dlg.show();
        };

        if (account.sourceId === "IMAP") {
            var barricadeDialog = new A.AccountBarricadeDialog(account);

            barricadeDialog.showChooseAccountTypeDialog(function (accountType) {
                var sourceId = "";
                switch (accountType) {
                    case Plat.AccountType.easAccountFactory:
                        launchAccountDialog(platform.accountManager.getAccountBySourceId("EXCH", ""));
                        break;
                    case Plat.AccountType.imapAccountFactory:
                        launchAccountDialog(account);
                        break;
                }
            });
        } else {
            launchAccountDialog(account);
        }
    };

    var manageByType = [];
    manageByType[Plat.ConfigureType.createConnectedAccount] = /*@bind(FlowLauncher)*/function (account, reconnect) {
        if ((account.sourceId === "ABCH") && !this._hasDefaultAccount()) {
            A.showCredUIAsync(function () {
                // we just connected a default account, so let the platform know
                this._forcePlatformConnectedIdCheckAsync(this._platform);
            }.bind(this), Jx.fnEmpty, Jx.fnEmpty, Plat.Result.defaultAccountDoesNotExist);
        } else {
            this._launchAddAccount(account, reconnect);
        }
    };
    manageByType[Plat.ConfigureType.editOnWeb] = function (account, reconnect) {
        if (!this._hasDefaultAccount()) {
            A.showCredUIAsync(function () {
                // we just connected a default account, so let the platform know
                this._forcePlatformConnectedIdCheckAsync(this._platform)
                .then(function () {
                    var meContact = this._platform.accountManager.defaultAccount.meContact;
                    if (meContact.cid.value === 0) {
                        return P.Promises.waitForPropertyChange(meContact, "cid");
                    }
                }.bind(this))
                .then(function () {
                    this._launchWebAuthAddFlow(account, reconnect);
                }.bind(this));
            }.bind(this), Jx.fnEmpty, Jx.fnEmpty, Plat.Result.defaultAccountDoesNotExist);
        } else {
            this._launchWebAuthAddFlow(account, reconnect);
        }
    };
    manageByType[Plat.ConfigureType.editOnClient] = function (account, reconnect) {
        A.showAccountSettingsPage(this._platform, this._scenario, A.AccountSettingsPage.perAccountSettings, {launchedFromApp: true, account: account, jobSet: this._jobSet});
    };

    FlowLauncher.prototype.launchManageFlow = function (account, reconnect) {
        ///<param name="account" type="Plat.Account" />
        /// <param name="reconnect" type="Boolean" optional="true" />
        var launchFlow = manageByType[account.getConfigureType(this._scenario)];
        Debug.assert(Jx.isFunction(launchFlow), "Unrecognized or unsupported configureType: " + account.getConfigureType(this._scenario));
        if (launchFlow) {
            launchFlow.call(this, account, reconnect);
        }
    };

    FlowLauncher.prototype.launchManageFlowByObjectId = function (objectId, reconnect) {
        /// <param name="objectId" type="String" />
        /// <param name="reconnect" type="Boolean" optional="true" />
        try {
            var account = /*@static_cast(Plat.Account)*/this._platform.accountManager.loadAccount(objectId);
            if (account !== null) {
                this.launchManageFlow(account, reconnect);
            }
        } catch (ex) {
            Jx.log.exception("FlowLauncher.prototype.launchManageFlowByObjectId failed", ex);
        }
    };
});
