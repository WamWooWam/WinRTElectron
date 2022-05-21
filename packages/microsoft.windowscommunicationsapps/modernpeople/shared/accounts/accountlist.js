
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*jshint browser:true */
/*global Jx,Debug,Microsoft,People,$include*/

Jx.delayDefine(People.Accounts, ["AccountListControl", "AccountListType"], function () {

    var P = window.People;
    var A = P.Accounts;
    var Plat = Microsoft.WindowsLive.Platform;

    function getDisplayName(asset) { return asset.displayName; }

    A.AccountListControl = function (type, platform, scenario, biciSuffix, options) {
        // <summary>Constructor</summary>
        // <param name="type" type="People.Accounts.AccountListType"/>
        // <param name="platform" type="Microsoft.WindowsLive.Platform.Client"/>
        // <param name="scenario" type="Microsoft.WindowsLive.Platform.ApplicationScenario"/>
        // <param name="biciSuffix" type="String" />
        // <param name="options" type="Object" optional="true">
        // options: { //configuration options, defaults are as shown and can be omitted.
        //     getAssetText: Function - return the display string - defaults to retrieving displayName
        //     selectionEnabled: false,
        //     delayRender: false,
        //     supportsContextMenus: true,
        //     largeIcons: false,
        //     showErrorStates: false,
        //     maxCount: -1, // no max, by default
        //     onPrimaryAction: function (account) {
        //        /// <summary>Used to override the default primary action</summary>
        //         /// <param name="account" type="IAccount">The account item that's
        //         /// been clicked</param>
        //         /// <returns type="Boolean">If true is returned, the control will 
        //         /// perform its default action.</returns>
        //         return true;
        //     }
        // } </param>
        A.ObjectListControl.call(this, "AccountList", (options || {}));
        A.AccountControlBase.call(this, platform, scenario);

        this._type = type;
        this._platform = platform;
        this._scenario = scenario;
        this._biciSuffix = biciSuffix;
        this._elItemTemplate = /*@static_cast(HTMLElement)*/null;
        this._options = options || {};

        // Handle options
        this._maxCount = (this._options.maxCount === undefined ? -1 : this._options.maxCount);
        this._useLargeIcons = !!this._options.largeIcons;
        this._showErrorStates = !!this._options.showErrorStates;
        this._getAssetText = this._options.getAssetText || getDisplayName;
        Debug.assert(this._maxCount !== 0, "0 is not a valid maxCount.");

        switch (this._type) {
            case A.AccountListType.filteredUpsells:
            case A.AccountListType.unfilteredUpsells:
            case A.AccountListType.connectedUpsells:
                this._onPrimaryAction = this._options.onPrimaryAction || function () { return true; };
                break;
            default:
                Debug.assert(false, "unknown list type");
                break;
        }

        Debug.assert(this._platform, "Must provide a platform!");

        $include("$(cssResources)/AccountListControl.css");
    };
    Jx.augment(A.AccountListControl, A.ObjectListControl);
    Jx.augment(A.AccountListControl, A.AccountControlBase);

    A.AccountListType = {
        filteredUpsells: 0,   // Do not show Upsells user has already added (e.g. Google, Live, etc).
        unfilteredUpsells: 1, // Show all available Upsells.
        connectedUpsells: 2   // Show only connected accounts.
    };
    Object.freeze(A.AccountListType);

    A.AccountListControl.prototype.updateAccountData = function (account) {
        /// <summary>Forces UI for the given Object to update</summary>
        /// <param name="object" type="Plat.Acount"/>
        this._updateObjectData(account);
    };

    A.AccountListControl.prototype._getCollection = function () {
        ///<summary>Returns the collection of accounts to render in the list.</summary>
        ///<returns type="Plat.Collection"/>
        var collection = null;
        var accountManager = this._platform.accountManager;
        if (accountManager.getConnectableAccountsByScenario && accountManager.getConnectedAccountsByScenario) {

            switch (this._type) {
                case A.AccountListType.filteredUpsells:
                    collection = accountManager.getConnectableAccountsByScenario(this._scenario, Plat.ConnectableFilter.excludeIfAnyAccountIsConnected);
                    break;
                case A.AccountListType.unfilteredUpsells:
                    collection = accountManager.getConnectableAccountsByScenario(this._scenario, Plat.ConnectableFilter.normal);
                    break;
                case A.AccountListType.connectedUpsells:
                    collection = accountManager.getConnectedAccountsByScenario(this._scenario, Plat.ConnectedFilter.includeDisabledAccounts, Plat.AccountSort.name);
                    break;
                default:
                    Debug.assert(false, "unknown list type");
                    break;
            }

            if (this._maxCount > 0) {
                // Wrap the real collection in a capped collection object.
                var realCollection = collection;
                collection = this._collection = new People.CappedPlatformCollection(realCollection, this._maxCount);
            }

            collection.unlock();
        }
        return collection;
    };

    A.AccountListControl.prototype._getChildObject = function (object) {
        ///<summary>Returns the application-specific resource for the given account object</summary>
        ///<param name="object" type="Plat.Object"/>
        ///<return type="Plat.Object"/>
        if (this._showErrorStates) {
            var account = /*@static_cast(Plat.Account)*/object;
            var resourceType = A.AccountControlBase.mapAppScenarioToResourceType[this._scenario];
            Debug.assert(Jx.isNumber(resourceType));
            return account.getResourceByType(resourceType);
        }
        return null;
    };

    A.AccountListControl.prototype._getNewObjectItem = function () {
        /// <summary>Generates a new element ready to be filled with account data and added to the DOM.</summary>
        /// <returns type="HTMLElement"/>
        var template = this._elItemTemplate;
        if (template === null) {
            this._elItemTemplate = template = document.createElement("div");
            template.setAttribute("role", "option");
            template.innerHTML =
                "<div class='ali singleLineText'>" +
                    "<div class='ali-leftColumn' aria-hidden='true'>" +
                        "<div id='ali_icon' class='" + (this._useLargeIcons ? "ali-largeIcon" : "ali-icon") + "'></div>" +
                    "</div>" +
                    "<div class='ali-rightColumn' aria-hidden='true'>" +
                        "<div class='ali-displayName singleLineText'></div>" +
                        "<div class='ali-description singleLineText'></div>" +
                    "</div>" +
                "</div>";
        }

        var item = template.cloneNode(true);
        item.id = "idAccountItem_" + Jx.uid();
        P.Animation.addPressStyling(item.firstElementChild);
        return item;
    };

    A.AccountListControl.prototype._applyObject = function (item, object) {
        /// <summary>Fills a list item with the data from the given object</summary>
        /// <param name="item" type="HTMLElement"/>
        /// <param name="object" type="Plat.Object"/>
        var account = /*@static_cast(Plat.Account)*/object;

        var iconElement = item.querySelector("#ali_icon");
        iconElement.style.backgroundImage = "url(" + account.iconMediumUrl + ")";

        // Set the display name.
        var displayName = item.querySelector(".ali-displayName");
        var displayNameId = "ali_displayName" + Jx.uid();
        displayName.id = displayNameId;
        item.setAttribute('aria-labelledby', displayNameId);

        displayName.innerText = this._getAssetText(account);

        // Set the description text.
        var eDescription = item.querySelector(".ali-description");
        var eDescriptionId = "ali_description" + Jx.uid();
        eDescription.id = eDescriptionId;
        item.setAttribute("aria-describedby", eDescriptionId);

        switch (this._type) {
            case A.AccountListType.unfilteredUpsells:
                eDescription.innerText = this._calcUpsellDescriptionText(account);
                break;
            case A.AccountListType.connectedUpsells:
                var curError = this._getCurrentError(account);
                if (A.KnownAccountError.none === curError) {
                    eDescription.innerText = account.emailAddress || account.userDisplayName;
                    // Ensures email addresses would ellipsis correctly in RTL languages
                    if (account.emailAddress && Jx.isRtl()) {
                        eDescription.style.direction = "ltr";
                        eDescription.style.textAlign = "right";
                    }
                    Jx.removeClass(eDescription, "ali-errorText");
                } else if ((A.KnownAccountError.removalNeeded === curError) ||
                           (A.KnownAccountError.oauthCredentialError === curError)) {
                    eDescription.innerText = Jx.res.getString("/accountsStrings/alc-attentionNeededText");
                    Jx.addClass(eDescription, "ali-errorText");
                } else {
                    eDescription.innerText = Jx.res.getString("/accountsStrings/alc-errorText");
                    Jx.addClass(eDescription, "ali-errorText");
                }
                break;
            case A.AccountListType.filteredUpsells:
                // We don't have description text in the upsell
                Jx.addClass(displayName, "noDescription");
                break;
            default:
                Debug.assert(false, "unknown list type");
                break;
        }

        A.ObjectListControl.prototype._applyObject.call(this, item, object);
    };

    A.AccountListControl.prototype._calcUpsellDescriptionText = function (account) {
        /// <summary>Builds the display string for an accounts description text</summary>
        /// <param name="account" type="Plat.Account"/>
        /// <returns type="String"/>
        Debug.assert(this._type === A.AccountListType.unfilteredUpsells, "Show not call _calcUpsellDescriptionText() for connected accounts");
        var summary = null;
        if ((account.sourceId === "ABCH") || (account.sourceId === "EXCH")) {
            summary = account.summary;
        }
        return summary || Jx.res.getString("/accountsStrings/alc-connectText");
    };

    A.AccountListControl.prototype._handlePrimaryAction = function (object) {
        /// <summary>Performs the primary action in response to a list item being clicked</summary>
        var account = /*@static_cast(Plat.Account)*/object;
        if (this._onPrimaryAction(account)) {
            var launcher = new A.FlowLauncher(this._platform, this._scenario, this._biciSuffix);
            launcher.launchManageFlow(account);
        }
    };
});
