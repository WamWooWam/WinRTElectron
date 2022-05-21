
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//
/// <disable>JS2076.IdentifierIsMiscased</disable>

Jx.delayDefine(People.Accounts, "Phase1Upsell", function () {

    var P = window.People,
        A = P.Accounts,
        Plat = Microsoft.WindowsLive.Platform;

    var Phase1Upsell = A.Phase1Upsell = function (platform, scenario, settings, stringIds, options) {
        /// <summary>The Phase 1 upsell control</summary>
        /// <param name="platform" type="Platform"/>
        /// <param name="scenario" type="Microsoft.WindowsLive.Platform.ApplicationScenario"/>
        /// <param name="settings" type="A.UpsellSettings" optional="true" />
        /// <param name="stringIds" type="Object">
        /// stringIds: { // resource string IDs which exist in the resources
        ///     titleId: "", // Used to retrieve the title text of the Upsell control
        ///     closeId: "", // Used to retrieve the close-btns text of the Upsell control
        ///     instructionsId: "" // Used to retrive the instruction text of the Upsell control. Optional.
        /// }</param>
        /// <param name="options" type="Object" optional="true">
        /// options: { //configuration options, defaults are as shown and can be omitted.
        ///     accountListType: A.AccountListType.filteredUpsells,
        ///     getAssetText: Function - given an account return the string to display
        ///     delayRender: false,
        ///     maxUpsellCount: 4,
        /// }</param>

        Debug.assert(platform, "Must provide a platform!");
        Debug.assert(Jx.isObject(stringIds), "Must provide stringIds");
        Debug.assert(Jx.isNonEmptyString(stringIds.phase1InstructionsId), "Must provide a valid instructionsId");

        this._platform = platform;
        this._scenario = scenario;
        this._settings = settings;
        this._accountList = /* @static_cast(A.AccountListControl)*/null;
        this._accountSync = /* @static_cast(A.AccountSynchronization)*/null;

        stringIds = stringIds || {};
        this._instructionsId = stringIds.phase1InstructionsId || "";
        this._dismissTextId = stringIds.phase1DismissId || "";

        this._options = options = options || {};
        this._suppressAddMore = options.suppressAddMore;
        this._delayRender = !!options.delayRender;
        this._maxUpsellCount = options.maxUpsellCount || 4;
        this._accountListType = "accountListType" in options ? options.accountListType : A.AccountListType.filteredUpsells;
        $include("$(cssResources)/Upsell.css");
        this.initComponent();
    };
    Jx.augment(Phase1Upsell, Jx.Component);

    Object.defineProperty(Phase1Upsell.prototype, "id", { get: function () { return this._id; } });

    // Jx.Component
    Phase1Upsell.prototype.getUI = function (ui) {
        /// <summary>Gets the UI string for the component.</summary>
        /// <param name="ui" type="Object">Returns the object which contains html and css properties.</param>
        var showDismiss = this._showDismiss = Jx.isNonEmptyString(this._dismissTextId);
        var dismissText = showDismiss ? Jx.res.getString(this._dismissTextId) : "";
        var moreText = this._suppressAddMore ? "" : Jx.res.getString("/accountsStrings/phase1addMore");
        var instructionsText = Jx.res.getString(this._instructionsId);
        ui.html =
        "<div id='" + this._id + "' class='phase1Upsell'>" +
            "<div class='upsell-flex'>" +
                "<div id='upsell_title' class='upsell-instructions' title='" + Jx.escapeHtml(instructionsText) + "'>" +
                    instructionsText +
                "</div>" +
                "<div id='accounts_container' class='upsell-accounts-container' aria-label='" + Jx.escapeHtml(instructionsText) + "'>" +
                     Jx.getUI(this._accountList).html +
                 "</div>" +
                 "<div id='upsell_more' class='upsell-more " + (this._suppressAddMore ? "hidden" : "") + "' tabIndex='0' role='button'>" +
                     "<div class='upsell-moreIconContainer'>" +
                         "<div id='upsell_moreIcon' class='upsell-moreIcon'>\uE115</div>" +
                     "</div>" +
                     "<div id='upsell_moreText' title='" + Jx.escapeHtml(moreText) + "' class='upsell-moreText singleLineText'>" +
                         moreText +
                     "</div>" +
                 "</div>" +
            "</div>" +
            "<div class='upsell-flexless'>" +
                "<div role='button' title='" + Jx.escapeHtml(dismissText) + "' class='upsell-dismiss typeSizeNormal" + (showDismiss ? "" : " hidden") + "' tabIndex='0' />" +
                    dismissText +
                "</div>" +
            "</div>" +
        "</div>";
    };

    Phase1Upsell.prototype.activateUI = function () {
        /// <summary>Called after the UI is initialized. getUI has been called at this point.</summary>
        var container = document.getElementById(this._id);
        if (!this._suppressAddMore) {
            // Hook DOM Events of 'add more' element
            var elMore = container.querySelector(".upsell-more");
            elMore.addEventListener("click", this._onAddMoreAccounts.bind(this), false);
            elMore.addEventListener("keydown", this._onKeyDown.bind(this), false);
            P.Animation.addPressStyling(elMore);
        }

        if (this._showDismiss) {
            var dismissElement = container.querySelector(".upsell-dismiss");
            dismissElement.addEventListener("click", this._onDismiss.bind(this), false);
            dismissElement.addEventListener("keydown", this._onDismissKeyDown.bind(this), false);
        }

        // Add the account list
        Debug.assert(this._accountList !== null, "Must check shouldShow() before adding the upsell to the tree!");
        Jx.Component.prototype.activateUI.call(this);
    };

    Phase1Upsell.prototype.shouldShow = function () {
        /// <summary>Called before hosting the control to ensure that it's not shown after it's been dismissed</summary>
        /// <returns type="Boolean"/>
        var shouldShow = true;
        if (this._accountList === null) {
            this._onAccountClick = this._onAccountClick.bind(this);
            this._accountList = new A.AccountListControl(this._accountListType,
                                                         this._platform,
                                                         this._scenario,
                                                         "canvas",
                                                         { delayRender: this._delayRender,
                                                             maxCount: this._maxUpsellCount,
                                                             largeIcons: true,
                                                             supportsContextMenus: false,
                                                             getAssetText: this._options.getAssetText,
                                                             onPrimaryAction: this._onAccountClick
                                                         });

            this.append(this._accountList);
        }

        if (this._getUpsellCount() <= 0) {
            shouldShow = false;

            // There is a first-run of the app, or something akin to it. listen to the platform
            // for the upsells as they become available.
            if (Jx.isNullOrUndefined(this._accountSync)) {
                var accountSync = this._accountSync = new A.AccountSynchronization(this._platform);
                if (accountSync.areAccountsAvailable()) {
                    // If we have no upsells, and intial sync is already finished, increment our phase
                    this._incrementPhase();
                    this._disposeAccountSync();
                } else {
                    this._onAccountsAvailableHandler = this._onAccountsAvailable;
                    accountSync.addListener("accountsAvailable", this._onAccountsAvailableHandler, this);
                }
            }
        }
        return shouldShow;
    };

    Phase1Upsell.prototype.render = function () {
        /// <summary>If the delayRender option was set, pass this along to the accountlist control</summary>
        Debug.assert(this._accountList !== null, "Invalid call to Phase1Upsell.render()");
        Debug.assert(this._delayRender, "You do not need to call Phase1Upsell.render() unless the delayRender option is set");
        this._accountList.render();
    };

    Phase1Upsell.prototype._getUpsellCount = function () {
        /// <summary>Returns the count of upsells that will be displayed. This helper extists solely to facilitate UTs.</summary>
        return this._accountList.getCount();
    };

    Phase1Upsell.prototype._onAccountsAvailable = function () {
        // If we have upsells, notify our parent, otherwise increment the phase.
            if (this._getUpsellCount() > 0) {
            this.fire("upsellAvailable", null, null);
            this._disposeAccountSync();
        } else {
            this._incrementPhase();
        }
    };

    Phase1Upsell.prototype._onAccountClick = function (ev) {
        this._incrementPhase();
        return true;
    };

    Phase1Upsell.prototype._onAddMoreAccounts = function (ev) {
        /// <summary>Click-event handler for the add-more-accounts link</summary>
        /// <param name="ev" type="HTMLEvent"/>
        A.showAccountSettingsPage(this._platform, this._scenario, A.AccountSettingsPage.upsells, { launchedFromApp: true });
        this._incrementPhase();
    };

    Phase1Upsell.prototype._onKeyDown = function (ev) {
        /// <summary>Key-down handler for the add-more-accounts link</summary>
        /// <param name="ev" type="HTMLEvent"/>
        if (ev.key === "Spacebar" || ev.key === "Enter") {
            this._onAddMoreAccounts();
            ev.preventDefault();
        }
    };

    Phase1Upsell.prototype._onDismiss = function (ev) {
        /// <summary>Click-event handler for the dismiss link</summary>
        /// <param name="ev" type="HTMLEvent"/>
        var settings = this._settings;
        if (settings) {
            settings.markDismissed();
        }
    };

    Phase1Upsell.prototype._onDismissKeyDown = function (ev) {
        /// <summary>Key-down handler for the add-more-accounts link</summary>
        /// <param name="ev" type="HTMLEvent"/>
        if (ev.key === "Spacebar" || ev.key === "Enter") {
            this._onDismiss();
            ev.preventDefault();
        }
    };

    Phase1Upsell.prototype._disposeAccountSync = function () {
        if (Jx.isFunction(this._onAccountsAvailableHandler)) {
            this._accountSync.removeListener("accountsAvailable", this._onAccountsAvailableHandler, this);
            this._onAccountsAvailableHandler = null;
        }

        Jx.dispose(this._accountSync);
        this._accountSync = null;
    };

    Phase1Upsell.prototype.deactivateUI = function () {
        this._disposeAccountSync();
        Jx.Component.prototype.deactivateUI.call(this);
    };

    Phase1Upsell.prototype._incrementPhase = function () {
        var settings = this._settings;
        if (settings) { 
            settings.incrementPhase();
        }
    };
});
