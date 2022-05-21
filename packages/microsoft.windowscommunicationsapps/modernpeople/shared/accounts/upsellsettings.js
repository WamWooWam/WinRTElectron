
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//
/// <disable>JS2076.IdentifierIsMiscased</disable>

Jx.delayDefine(People.Accounts, "UpsellSettings", function () {
    
    var P = window.People,
        A = P.Accounts;

    var UpsellSettings = A.UpsellSettings = function (settingsContainer) {
        /// <summary>Manages which Upsell we are supposed to show, and whether we should should show any upsell.</summary>
        ///<param name="settingsContainer" type="Jx.AppDataContainer">An app-contextual appDataContainer for storing local value</param>
        this._settingsContainer = settingsContainer.container("upsell");
        var phase = this._settingsContainer.get("phase");
        this._phase = Jx.isNullOrUndefined(phase) ? 1 : phase;
    };
    Jx.inherit(UpsellSettings, Jx.Events);
    var proto = UpsellSettings.prototype;
    Debug.Events.define(proto, "phaseChange");

    proto.getPhase = function () {
        return this._phase;
    };

    proto.shouldShow = function () {
        return this.getPhase() < UpsellSettings.maxPhase;
    };

    proto.incrementPhase = function () {
        Debug.assert(this._phase < UpsellSettings.maxPhase);
        this._setPhase(this._phase + 1);
    };

    proto.markDismissed = function () {
        /// <summary>Mark whether the Account upsell has been dismissed or not.</summary>
        Debug.assert(this._phase < UpsellSettings.maxPhase);
        this._setPhase(UpsellSettings.maxPhase);
    };

    proto._storePhase = function (phase) {
        this._settingsContainer.set("phase", phase);
    };

    proto._setPhase = function (phase) {
        if (phase !== this._phase) {
            this._phase = phase;
            this._storePhase(phase);
            this.raiseEvent("phaseChange", { phase: phase });
        }
    };

    proto.dispose = function () {
        Jx.dispose(this._settingsContainer);
    };

    UpsellSettings.maxPhase = 3;
    Object.freeze(UpsellSettings);

});
