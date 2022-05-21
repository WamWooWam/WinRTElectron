
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="Windows.Foundation.js" />
/// <reference path="Windows.UI.Popups.js" />
/// <reference path="%_NTTREE%\drop\published\ModernContactPlatform\Microsoft.WindowsLive.Platform.js" />
/// <reference path="..\..\..\Shared\Jx\Core\Jx.dep.js" />
/// <reference path="..\..\..\Shared\WinJS\WinJS.ref.js" />
/// <reference path="FromControl.ref.js" />

Jx.delayDefine(window, "FromControl", function () {

    $include("/FromControl/MailFromControl.css");

    window.FromControl = {};

    FromControl.CustomLayout = /*@constructor*/function () { };
    Jx.inherit(FromControl.CustomLayout, People.IdentityElements.BaseElement);
    var customLayoutProto = FromControl.CustomLayout.prototype;
    customLayoutProto.getUI = function (elementHost, locator, options) {
        /// <summary>Produces HTML for this element</summary>
        /// <param name="elementHost" type="People.ElementHost"></param>
        /// <param name="locator" type="String">The top-level node in the returned HTML must have this class.</param>
        /// <param name="options" type="People.IdentityElements.Options" optional="true">A set of configuration options, content varies per element.  To interact correctly with layouts, elements must respect the className property.</param>
        /// <returns type="String">An HTML string that represents this element</returns>
        return People.IdentityElements.makeElementWithAttributes(
            "div",
            locator,
            "fromControl-customLayout",
            options,
            "",
            elementHost.getUI(People.IdentityElements.Tile, {
                className: "fromControl-tileElement",
                size: "40",
                statusIndicator: null
            }) +
            '<div class="fromControl-label">' +
                Jx.res.getString("fromControlDescription") +
            '</div>' +
            '<div class="fromControl-textArea">' +
                elementHost.getUI(People.IdentityElements.Name, {
                    attributes: 'id="fromControlNameElement"',
                    className: "fromControl-nameElement"
                }) +
                '<div class="fromControl-emailElement">' +
                '</div>' +
                '<div class="fromControl-dropArrow">' +
                    "&#xE099;" +
                '</div>' +
            '</div>'
        );
    };
    customLayoutProto.activateUI = function (elementHost, node) {
        /// <summary>Allows the element to hook events on the specified node or begin delivering updates</summary>
        /// <param name="elementHost" type="People.ElementHost"/>
        /// <param name="node" type="HTMLElement">The node to which the id parameter specified in getUI was applied</param>
        this._element = node;
    };
    customLayoutProto.shutdownUI = function (elementHost) {
        /// <summary>Called when the IC is no longer used, provides an opportunity to clean up</summary>
        /// <param name="elementHost" type="People.ElementHost"></param>
        this._element = null;
    };

    // Mail platform coming from Mail.Utilities.getPlatform().accountManager / this._platform
    FromControl.FromControl = /*@constructor*/function (accountManager, peopleManager) {
        /// <summary>Returns a FromControl Jx component object initialized with parameter(s) specified.</summary>
        /// <param name="accountManager" type="Microsoft.WindowsLive.Platform.IAccountManager" optional="false">The AccountManager instance to use for the account data.</param>
        /// <param name="peopleManager" type="Microsoft.WindowsLive.Platform.IPeopleManager" optional="false">The PeopleManager instance to use for the account data.</param>
        NoShip.FromControl.markStart("ctor");
        // Save off the parameters
        Debug.assert(accountManager !== null);
        Debug.assert(peopleManager !== null);
        this._accountManager = accountManager;
        this._peopleManager = peopleManager;
        this._identityControl = /*@static_cast(People.IdentityControl)*/null;
        this._emailDiv = null;
        this._disabled = false;
        this._forceRefresh = false;

        // Bind needed functions
        this._onClick = this._onClick.bind(this);
        this._markActive = this._markActive.bind(this);
        this._markInactive = this._markInactive.bind(this);

        // Perform the basic refresh of the control
        this.refresh();

        // Allow remaining Jx initialize to continue
        this.initComponent();
        NoShip.FromControl.markStop("ctor");
    };
    Jx.augment(FromControl.FromControl, Jx.Component);

    var fromProto = FromControl.FromControl.prototype;
    fromProto.activateUI = function () {
        /// <summary>activateUI override for this component.</summary>
        NoShip.FromControl.markStart("activateUI");
        Debug.assert(this.constructor === FromControl.FromControl);
        Jx.Component.prototype.activateUI.call(this);
        this._identityControl.activateUI();
        this._element = document.body.querySelector(".fromControl-wrapper");
        this._element.setAttribute("data-multipleaccount", this._multipleAccounts.toString());
        this._selectableElement = this._element.querySelector(".fromControl-customLayout");
        this._selectableElement.setAttribute("aria-disabled", (!this._multipleAccounts).toString());
        this._selectableElement.setAttribute("role", "button");
        this._selectableElement.addEventListener("MSPointerDown", this._markActive);
        this._selectableElement.addEventListener("MSPointerUp", this._markInactive);

        // Show/hide the arrow and enable/disable hover animations
        if (this._multipleAccounts && !this._disabled) {
            Jx.addClass(this._selectableElement, "interactive");
        } else {
            Jx.removeClass(this._selectableElement, "interactive");
        }

        // Locate and set the email div
        this._emailDiv = this._element.querySelector(".fromControl-emailElement");
        Debug.assert(Jx.isHTMLElement(this._emailDiv));
        if (this._selectedEmail) {
            this._emailDiv.innerHTML = Jx.escapeHtml(this._selectedEmail);
        }

        NoShip.FromControl.markStop("activateUI");
    };
    fromProto.click = function () {
        /// <summary>Executes a programatic click of the control, causing the same reaction as if a user clicked the control.</summary>
        this._element.focus();
        this._onClick();
    };
    fromProto._markActive = function () {
        /// <summary>Adds a class to the selectable element so that children can style themselves appropriately</summary>
        Debug.assert(Jx.isHTMLElement(this._selectableElement));
        this._selectableElement.classList.add("active");
    };
    fromProto._markInactive = function () {
        /// <summary>Removes the "active" class from the selectable element so that children can style themselves appropriately</summary>
        Debug.assert(Jx.isHTMLElement(this._selectableElement));
        this._selectableElement.classList.remove("active");
    };
    fromProto.deactivateUI = function () {
        /// <summary>deactivateUI override for this component.</summary>
        NoShip.FromControl.markStart("deactivateUI");
        Debug.assert(this.constructor === FromControl.FromControl);
        Jx.Component.prototype.deactivateUI.call(this);
        this._identityControl.shutdownUI();
        this._selectableElement.removeEventListener("MSPointerDown", this._markActive);
        this._selectableElement.removeEventListener("MSPointerUp", this._markInactive);
        this._selectableElement = null;
        this._element = null;
        NoShip.FromControl.markStop("deactivateUI");
    };
    Object.defineProperty(fromProto, "selectedAccount", { get: function () { return this._selectedAccount; }, enumerable: true});
    Object.defineProperty(fromProto, "selectedEmailAddress", { get: function () { return this._selectedEmail; }, enumerable: true});
    fromProto.getUI = function (ui) {
        /// <summary>getUI override for this component.</summary>
        /// <param name="ui" type="JxUI" optional="false">The ui object.</param>
        NoShip.FromControl.markStart("getUI");
        ui.html = this._identityControl.getUI(FromControl.WrapperLayout, { attributes: 'id="fromControl"' });
        NoShip.FromControl.markStop("getUI");
    };
    fromProto.onAccountChanged = null;
    fromProto.multipleAccounts = function () {
        /// <summary>Determines if there are multiple accounts to choose from.</summary>
        /// <returns type="Boolean">True if there are multiple accounts, false otherwise.</returns>
        return this._multipleAccounts;
    };
    fromProto.refresh = function () {
        /// <summary>Refreshes the control's knowledge of accounts and the corresponding UI.</summary>
        /// <returns type="Boolean">True if the refresh requires a new call to initUI, false if it does not.</returns>
        NoShip.FromControl.markStart("refresh");
        // Fetch the account collection
        var wl = Microsoft.WindowsLive.Platform,
            accounts = this._accountManager.getConnectedAccountsByScenario(wl.ApplicationScenario.mail, wl.ConnectedFilter.normal, wl.AccountSort.rank);
        Debug.assert(accounts.count > 0, "From Control requires at least 1 account to exist");

        // Calculate email addresses with disambiguator values
        var emailToAccountMap = {},
            account,
            m;
        // Sort all accounts by email address
        for (m = accounts.count; m--; ) {
            account = /*@static_cast(Microsoft.WindowsLive.Platform.IAccount)*/accounts.item(m);
            var sendAsAddresses = account.sendAsAddresses;
            for (var i = 0, iMax = sendAsAddresses.size; i < iMax; i++) {
                var email = sendAsAddresses[i];
                if (!emailToAccountMap[email]) {
                    emailToAccountMap[email] = [];
                }
                emailToAccountMap[email].push(account);
            };
        }
        // Translate list back into a flat list with disambiguators if needed
        var keys = Object.keys(emailToAccountMap),
            list,
            accountList = [],
            n;
        for (m = keys.length; m--; ) {
            var emailAddress = keys[m];
            list = /*@static_cast(Array)*/emailToAccountMap[emailAddress];
            if (list.length === 1) {
                accountList.push({ account: list[0], emailAddress: emailAddress, displayEmailAddress: emailAddress});
            } else {
                for (n = list.length; n--; ) {
                    accountList.push({ account: list[n], emailAddress: emailAddress, displayEmailAddress: emailAddress + "(" + list[n].displayName + ")" });
                }
            }
        }

        accountList.sort(function (a, b) {
            /// <param name="a" type="__FromControl.AccountListElement" />
            /// <param name="b" type="__FromControl.AccountListElement" />
            return a.displayEmailAddress.localeCompare(b.displayEmailAddress);
        });

        this._accountList = accountList;

        // If we switched between a single and multiple accounts
        var multipleAccounts = (this._accountList.length > 1);
        if ((multipleAccounts !== this._multipleAccounts) || this._forceRefresh) {
            // Update our multiple accounts flag
            this._multipleAccounts = multipleAccounts;

            // Calculate new first recipient
            account = /*@static_cast(Microsoft.WindowsLive.Platform.IAccount)*/accounts.item(0);
            var emailToUse = this._getValidEmailAddress(account, account.preferredSendAsAddress),
                recipient = account.meContact;
            if (!recipient) {
                recipient = this._peopleManager.loadRecipientByEmail(emailToUse, account.displayName);
            }
            this._selectedAccount = account;
            this._selectedEmail = emailToUse;
            this._fireAccountChanged();

            // Update our IC
            if (!Jx.isNullOrUndefined(this._identityControl)) {
                this._identityControl.shutdownUI();
            }

            this._identityControl = new People.IdentityControl(recipient, null, {
                interactive: (this._multipleAccounts && !this._disabled),
                getTooltip: this._getTooltip,
                onClick: this._onClick,
                pressEffect: false // Disable press animation
            });
            this._forceRefresh = false;

            // Return true to indicate the UI needs to be reloaded
            NoShip.FromControl.markStop("refresh");
            return true;
        }

        // We didn't switch between multiple/single accounts, so we can keep the same UI
        NoShip.FromControl.markStop("refresh");
        return false;
    };
    fromProto.select = function (accountId, emailAddress) {
        /// <summary>Changes the selection to the requested account, if the account is found.</summary>
        /// <param name="accountId" type="String" optional="false">The account id to select.</param>
        /// <param name="emailAddress" type="String" optional="false">The email address to send from.</param>
        NoShip.FromControl.markStart("select");
        if (this._multipleAccounts && (this._selectedAccount.objectId !== accountId || this._selectedEmail !== emailAddress)) {
            var accountList = this._accountList;
            for (var m = accountList.length; m--; ) {
                if (accountList[m].account.objectId === accountId) {
                    this.selectAccount(/*@static_cast(Microsoft.WindowsLive.Platform.IAccount)*/accountList[m].account, emailAddress);
                    break;
                }
            }
        }
        NoShip.FromControl.markStop("select");
    };
    fromProto.selectAccount = function (account, emailAddress) {
        /// <summary>Changes the selection to the requested account.</summary>
        /// <param name="account" type="Microsoft.WindowsLive.Platform.IAccount" optional="false">The account to select.</param>
        /// <param name="emailAddress" type="String" optional="false">The email address to send from.</param>
        NoShip.FromControl.markStart("selectAccount");
        Debug.assert(Jx.isNonEmptyString(emailAddress));
        var emailToUse = this._getValidEmailAddress(account, emailAddress),
            recipient = account.meContact;
        if (!recipient) {
            recipient = this._peopleManager.loadRecipientByEmail(emailToUse, account.displayName);
        }
        this._identityControl.updateDataSource(recipient);

        this._selectedAccount = account;
        this._selectedEmail = emailToUse;

        // Update the email div
        if (this._emailDiv) {
            this._emailDiv.innerHTML = Jx.escapeHtml(this._selectedEmail);
        }

        this._fireAccountChanged();
        NoShip.FromControl.markStop("selectAccount");
    };

    Object.defineProperty(fromProto, "disabled", {
        get: function () { return this._disabled; },
        set: function (disabled) {
            NoShip.FromControl.markStart("disabled");
            if (this._disabled !== disabled) {
                this._disabled = disabled;
                this._forceRefresh = true;
            }
            NoShip.FromControl.markStop("disabled");
        },
        enumerable: true
    });

    fromProto._getValidEmailAddress = function (account, emailAddress) {
        /// <summary>If emailAddress is a valid send as address for account, this returns emailAddress.
        /// if not, this returns the default address on the account.</summary>
        /// <param name="account" type="Microsoft.WindowsLive.Platform.IAccount" />
        /// <param name="emailAddress" type="String" />
        Debug.assert(Jx.isInstanceOf(account, Microsoft.WindowsLive.Platform.IAccount));
        Debug.assert(Jx.isString(emailAddress));
        var sendAsAddresses = account.sendAsAddresses;

        if (Array.prototype.indexOf.call(sendAsAddresses, emailAddress) !== -1) {
            return emailAddress;
        } else {
            return account.emailAddress;
        }
    };

    fromProto._fireAccountChanged = function () {
        /// <summary>Invokes account changed handler if set using currently selected account.</summary>
        if (typeof this.onAccountChanged === "function") {
            // Guard against handlers throwing exceptions.
            try {
                this.onAccountChanged(this._selectedAccount);
            } catch (error) {
                Jx.log.error("FromControl unexpected exception on account changed handler: " + String(error));
            }
        }
    };
    fromProto._getTooltip = function (dataObject, defaultText) {
        /// <summary>Defines the tooltip behavior in the IC.</summary>
        /// <param name="dataObject"></param>
        /// <param name="defaultText" type="String">The default IC tooltip text.</param>
        /// <returns type="String">The tooltip value.</returns>
        return Jx.res.getString("fromControlTooltip");
    };
    fromProto._onClick = function (dataSource) {
        /// <summary>Defines the click behavior for the IC.</summary>
        /// <param name="dataSource" type="IdentityControlDataSource"></param>
        /// <returns type="Boolean">If true is returned, the IC will perform its default action, navigating to the profile.</returns>
        if (this._multipleAccounts && !this._disabled) {
            // Create temporary element (can't reuse elements in this control)
            var menuElement = document.createElement("div");
            menuElement.id = "fromControlDropDown_" + menuElement.uniqueID;
            // Set most of the styles
            menuElement.className = "fromControl-dropDown";
            document.body.appendChild(menuElement);

            // Generate a list of commands / menu items
            var myCommands = [],
                thisAccount,
                accountList = this._accountList,
                that = this;
            for (var i = 0, iMax = accountList.length; i < iMax; i++) {
                thisAccount = /*@static_cast(__FromControl.AccountListElement)*/accountList[i];
                myCommands.push({
                    id: "fromControlOption" + i.toString(),
                    label: thisAccount.displayEmailAddress,
                    onclick: (function (value) {
                        /// <param name="value" type="__FromControl.AccountListElement" />
                        return function () {
                            menu.hide();
                            WinJS.UI.Animation.fadeOut(that._element).then(null, function (e) {
                                // If we completed with an error, log it and continue
                                Jx.log.error("Error while trying to fade out the From Control:" + e);
                                Debug.assert(false, "Error while trying to fade out the From Control:" + e);
                            }).then(function () {
                                that.selectAccount(value.account, value.emailAddress);
                                return WinJS.UI.Animation.fadeIn(that._element);
                            }).done(null, function (er) {
                                // If we completed with an error, log it
                                Jx.log.error("Error while trying to fade in the From Control:" + er);
                                Debug.assert(false, "Error while trying to fade in the From Control:" + er);
                            });
                        };
                    })(thisAccount)
                });
            }

            var menu = /*@static_cast(WinJS.UI.Flyout)*/new WinJS.UI.Menu(menuElement, {
                commands: myCommands
            });
            menu.element.setAttribute("aria-label",Jx.res.getString("fromControlTooltip"));
            this._selectableElement.setAttribute("aria-selected", "true");
            this._selectableElement.setAttribute("aria-expanded", "true");
            this._selectableElement.setAttribute("aria-owns", menuElement.id);
            menu.addEventListener("afterhide", function () {
                // Sometimes the afterhide event fires twice, so we check it hasn't already been removed
                if (menuElement.parentNode) {
                    // Clean up the temp element after its been shown
                    document.body.removeChild(menuElement);
                    that._selectableElement.setAttribute("aria-selected", "false");
                    that._selectableElement.setAttribute("aria-expanded", "false");
                    that._selectableElement.setAttribute("aria-owns", "");
                }
            });
            // Show the menu
            var menuHorizontalAlignment = Jx.isRtl() ? "right" : "left";
            menu.show(this._selectableElement, "bottom", menuHorizontalAlignment);
        }
        return false;
    };
    fromProto._accountManager = /*@static_cast(Microsoft.WindowsLive.Platform.IAccountManager)*/null;
    fromProto._multipleAccounts = /*@static_cast(Boolean)*/null;
    fromProto._peopleManager = /*@static_cast(Microsoft.WindowsLive.Platform.IPeopleManager)*/null;
    fromProto._selectedAccount = /*@static_cast(Microsoft.WindowsLive.Platform.IAccount)*/null;
    fromProto._selectedEmail = /*@static_cast(String)*/null;

    FromControl.WrapperLayout = /*@constructor*/function () { };
    Jx.inherit(FromControl.WrapperLayout, People.IdentityElements.BaseElement);
    var wrapperLayoutProto = FromControl.WrapperLayout.prototype;
    wrapperLayoutProto.getUI = function (elementHost, locator, options) {
        /// <summary>Produces HTML for this element</summary>
        /// <param name="elementHost" type="People.ElementHost"></param>
        /// <param name="locator" type="String">The top-level node in the returned HTML must have this class.</param>
        /// <param name="options" type="People.IdentityElements.Options" optional="true">A set of configuration options, content varies per element.  To interact correctly with layouts, elements must respect the className property.</param>
        /// <returns type="String">An HTML string that represents this element</returns>
        return People.IdentityElements.makeElementWithAttributes(
            "span",
            locator,
            "fromControl-wrapper",
            options,
            "",
            elementHost.getUI(FromControl.CustomLayout, {})
        );
    };

    FromControl.buildFromString = function (emailAddress, account) {
        // <summary>Helper function that produces a string to be used as the from property on a message.
        // The string will either be of the form "johndoe@example.com" or "John Doe <johndoe@example.com>" </summary>
        /// <param name="emailAddress" type="String" />
        /// <param name="account" type="Microsoft.WindowsLive.Platform.IAccount" />
        /// <returns type="String" />
        Debug.assert(Jx.isNonEmptyString(emailAddress));
        Debug.assert(Jx.isInstanceOf(account, Microsoft.WindowsLive.Platform.IAccount));

        var primaryEmail = account.emailAddress;

        // If the primary email address is being used, see if we have a non-empty display name
        // that is different from the email address. If so, build up a full from string. If not, just
        // set the email address as the from string
        if (primaryEmail === emailAddress) {
            var displayName = account.userDisplayName;
            if (Jx.isNonEmptyString(displayName) && displayName !== emailAddress) {
                return displayName + " <" + emailAddress + ">";
            } else {
                return emailAddress;
            }
        } else {
            return emailAddress;
        }
    };

    
    NoShip.FromControl = {
        markStart: function (eventName) {
            /// <summary>Marks the start of an event.</summary>
            /// <param name="eventName" type="String">Event name</param>
            window.msWriteProfilerMark("FromControl." + eventName + ",StartTA,FromControl");
        },
        markStop: function (eventName) {
            /// <summary>Marks the end of an event.</summary>
            /// <param name="eventName" type="String">Event name</param>
            window.msWriteProfilerMark("FromControl." + eventName + ",StopTA,FromControl");
        }
    };
    
});
