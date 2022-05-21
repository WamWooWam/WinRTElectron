
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//
/// <reference path="UpsellSettings.js"/>
/// <disable>JS2076.IdentifierIsMiscased</disable>

Jx.delayDefine(People.Accounts, "UpsellControl", function () {
    
    var P = window.People,
        A = P.Accounts,
        Plat = Microsoft.WindowsLive.Platform;

    var UpsellControl = A.UpsellControl = function (platform, scenario, settings, stringIds, options) {
        /// <summary>Constructor</summary>
        /// <param name="platform" type="Platform"/>
        /// <param name="scenario" type="Microsoft.WindowsLive.Platform.ApplicationScenario"/>
        /// <param name="settings" type="A.UpsellSettings"/>
        /// <param name="stringIds" type="Object">
        /// stringIds: { // resource string IDs which exist in the resources
        ///     phase1AddMoreId: "", // Used to retrieve the add-more-accounts link of the Upsell control
        ///     phase1DismissId: "", // Used to retrieve the close-btns text of the Upsell control
        ///     phase1InstructionsId: "" // Used to retrive the instruction text of the Upsell control. Optional.
        /// }</param>
        /// <param name="options" type="Object" optional="true">
        /// options: { //configuration options, defaults are as shown and can be omitted.
        ///     accountListType: A.AccountListType.filteredUpsells,
        ///     getAssetDisplay: Function - given an account return the string to display
        ///     delayRender: false,
        ///     maxUpsellCount: 4,
        /// }</param>
        Debug.assert(platform, "Must provide a platform!");
        Debug.assert(Jx.isObject(stringIds), "Must provide stringIds");

        this._platform = platform;
        this._scenario = scenario;
        this._settings = settings;
        this._upsell = null;
        this._stringIds = stringIds;
        this._options = options || {};
        this._phase1Ctor = options.phase1Ctor || A.Phase1Upsell;
        this._phase2Ctor = options.phase2Ctor || A.Phase2Upsell;
        this.initComponent();
        this._settings.addListener("phaseChange", this._onPhaseChange, this);
    };
    Jx.inherit(UpsellControl, Jx.Component);

    Object.defineProperty(UpsellControl.prototype, "id", { get: function () { return this._id; } });

    // Jx.Component
    UpsellControl.prototype.getUI = function (ui) {
        /// <summary>Gets the UI string for the component.</summary>
        /// <param name="ui" type="Object">Returns the object which contains html and css properties.</param>
        $include("$(cssResources)/Upsell.css");
        this._ensureUpsell();
        ui.html = "<div id='" + this._id + "' class='upsell-container'>" +
                      Jx.getUI(this._upsell).html +
                  "</div>";
    };

    UpsellControl.prototype.activateUI = function () {
        /// <summary>Called after the UI is initialized. getUI has been called at this point.</summary>
        this._containerElement = document.getElementById(this._id);
        Jx.Component.activateUI.call(this);
    };

    var upsellFactories = [];
    upsellFactories[1] = /*@bind(UpsellControl)*/ function (settings, stringIds, platform, scenario, options) {
        var upsell = this._upsell = new this._phase1Ctor(platform, scenario, settings, stringIds, options);
        if (!upsell.isInit()) {
            upsell.initComponent();
        }
        upsell.on("upsellAvailable", this._onUpsellAvailable, this);
        return upsell;
    };
    upsellFactories[2] = function (settings, stringIds, platform, scenario) {
        var upsell = new this._phase2Ctor(settings, stringIds, platform, scenario);
        if (!upsell.isInit()) {
            upsell.initComponent();
        }
        return upsell;
    };

    UpsellControl.prototype._onUpsellAvailable = function () {
        // re-raise the event
        this.fire("upsellAvailable", null, null);
    };

    UpsellControl.prototype._ensureUpsell = function () {
        var noUpsell = this._upsell === null;
        var createUpsell = noUpsell && this._settings.shouldShow();
        if (createUpsell) {
            var factory = upsellFactories[this._settings.getPhase()];
            this._upsell = factory.call(this, this._settings, this._stringIds, this._platform, this._scenario, this._options);
            this.append(this._upsell);
        }
        return !noUpsell || createUpsell;
    };

    UpsellControl.prototype._updateUpsell = function () {
        if (!Jx.isNullOrUndefined(this._upsell)) {
            this._upsell.deactivateUI();
            this.removeChild(this._upsell);
            this._upsell = null;
        }

        if (this.shouldShow()) {
            // It's possible we get told of a phase change before UI is created or activated
            if (!Jx.isNullOrUndefined(this._containerElement)) {
                this._upsell.initUI(this._containerElement);
            }
            this._onUpsellAvailable();
        }
    };

    UpsellControl.prototype._onPhaseChange = function (ev) {
        this._updateUpsell();
        if (ev.phase >= A.UpsellSettings.maxPhase) {
            this.fire("upsellDismissed", null, null);
        }
    };

    UpsellControl.prototype.shouldShow = function () {
        var upsell = this._upsell;
        var shouldShow = this._settings.shouldShow() && this._ensureUpsell() && (!this._upsell.shouldShow || this._upsell.shouldShow());
        // It's possible that by calling shouldShow(), our upsell changed out from underneath us.  If that happened,
        // return the new upsell's answer
        return shouldShow || (upsell !== this._upsell && this._upsell && (!this._upsell.shouldShow || this._upsell.shouldShow()));
    };

    UpsellControl.prototype.getPhase = function () {
        return this._settings.getPhase();
    };

    UpsellControl.prototype.render = function () {
        if (this._upsell.render) {
            this._upsell.render();
        }
    };

    UpsellControl.prototype.shutdownComponent = function () {
        /// <summary>Called when our control is being hidden</summary>
        Jx.dispose(this._settings);
        Jx.Component.prototype.shutdownComponent.call(this);
    };

});
