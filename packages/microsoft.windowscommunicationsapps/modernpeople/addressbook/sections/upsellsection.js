
//
// Copyright (C) Microsoft. All rights reserved.
//
/*jshint browser:true */
/*global Jx,Debug,Microsoft,NoShip,People*/

Jx.delayDefine(People, "UpsellSection", function () {
    
    var P = window.People;
    var Plat = Microsoft.WindowsLive.Platform;

    P.UpsellSection = /* @constructor*/function (platform, upsellSettings) {
        ///<summary>The Upsell section displays the Upsell control</summary>
        ///<param name="platform" type="Microsoft.WindowsLive.Platform.Client"/>
        ///<param name="upsellSettings" type="P.Accounts.UpsellSettings" />
        P.StaticSection.call(this, "upsellSection");
        this._renderRequested = false;

        var stringIds = { 
            phase1InstructionsId: "/strings/upsellInstructions",
            phase1DismissId: "/strings/upsellPhase1Dismiss",
            phase2InstructionsId: "/strings/upsellPhase2Instructions"
        };

        var options = {
            getAssetText: function (asset) { return asset.serviceContactsName; }, 
            delayRender: true,
            phase2Ctor: Jx.Component
        };
        this._upsellControl = new P.Accounts.UpsellControl(platform,
                                                           Plat.ApplicationScenario.people,
                                                           upsellSettings,
                                                           stringIds,
                                                           options);
        this.appendChild(this._upsellControl);

        // List for the upsell's dismissal
        Jx.EventManager.addListener(this._upsellControl, "upsellDismissed", this._onUpsellDismissed.bind(this), this);
    };
    Jx.inherit(P.UpsellSection, P.StaticSection);

    P.UpsellSection.prototype.hydrateExtent = function (data) {
        if (this._upsellControl.shouldShow() && this._upsellControl.getPhase() <= 1) {
            var ui = Jx.getUI(this._upsellControl);
            this._contentElement.innerHTML = ui.html;
            this._upsellControl.activateUI();
        } else {
            this.hide();
        }

        // Give the upsell control the opportunity to inform when upsells become avaiable and to show the Upsell control.
        Jx.EventManager.addListener(this._upsellControl, "upsellAvailable", this._onUpsellsAvailable.bind(this), this);
        P.StaticSection.prototype.hydrateExtent.call(this, data);
    };
    P.UpsellSection.prototype.render = function () {
        ///<summary>Rendering the Upsell section</summary>
        P.StaticSection.prototype.render.call(this);
        if (this._upsellControl.shouldShow() && this._upsellControl.getPhase() <= 1) {
            this._upsellControl.render();
        }
        this._renderRequested = true;
    };
    P.UpsellSection.prototype._onUpsellDismissed = function () {
        if (!this._hidden) {
            this.hide();
        }
        
        if (this._upsellControl) {
            this.removeChild(this._upsellControl);
            this._upsellControl.shutdownUI();
            this._upsellControl = null;
        }
    };
    P.UpsellSection.prototype._onUpsellsAvailable = function () {
        if (this._hidden) {
            Debug.assert(Jx.isObject(this._upsellControl));
            this._upsellControl.initUI(this._contentElement);

            if (this._renderRequested) {
                this._upsellControl.render();
            }

            this.show();
            NoShip.People.etw("upsellReady_success");
        } else if (this._upsellControl && this._upsellControl.getPhase() > 1) {
            this._onUpsellDismissed();
        }
    };
    P.UpsellSection.prototype._upsellControl = /* @static_cast(P.Accounts.UpsellControl)*/null;
});



