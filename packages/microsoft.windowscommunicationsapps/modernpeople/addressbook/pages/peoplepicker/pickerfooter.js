
// Copyright (C) Microsoft Corporation.  All rights reserved.

Jx.delayDefine(People, "PickerFooter", function () {

    var P = window.People;
    var Plat = Microsoft.WindowsLive.Platform;

    P.PickerFooter = /* @constructor*/function (basket, platform, jobSet) {
        /// <summary>Constructor</summary>
        /// <param name="basket" type="Windows.ApplicationModel.Contacts.Provider.IContactPickerUI"/>
        /// <param name="jobSet" type="Plat.Client"/>
        /// <param name="jobSet" type="P.JobSet"/>
        this._name = "People.PickerHeader";
        this._platform = platform;
        this._jobSet = jobSet;

        var AppScenario = Plat.ApplicationScenario;

        this._connectedTo = new P.Accounts.ConnectedAccounts(AppScenario.people, jobSet, false, true);
        this._connectedTo.setPlatform(this._platform);
        this.appendChild(this._connectedTo);

        this.initComponent();
    };

    Jx.augment(P.PickerFooter, Jx.Component);

    P.PickerFooter.prototype.getUI = function (ui) {
        ui.html = "<div class='connectedAccountsControl' id='idConnectedAccountsControl'>" +
                    Jx.getUI(this._connectedTo).html +
                  "</div>";
    };

    P.PickerFooter.prototype.shutdownComponent = function () {
        this._connectedTo = null;
        Jx.Component.prototype.shutdownComponent.call(this);
    };

});
