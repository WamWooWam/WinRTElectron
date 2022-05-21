
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//
/*jshint browser:true */
/*global Mail,Jx,Debug,Microsoft*/

Jx.delayDefine(Mail, "AccountSwitcher", function () {
    "use strict";

    var P = Microsoft.WindowsLive.Platform,
            ChangeType = P.CollectionChangeType;

    Mail.AccountSwitcher = function (platform, host, selection, scheduler, createFlyout) {
        Mail.log("AccountList_Ctor", Mail.LogEvent.start);
        Debug.assert(Jx.isObject(platform));
        Debug.assert(Jx.isObject(host));
        Debug.assert(Jx.isObject(selection));
        Debug.assert(Jx.isObject(scheduler));

        this.initComponent();

        this._selection = selection;

        this._host = host;
        this._element = null;
        this._hooks = null;
        this._listElement = null;
        this._switcherButton = null;
        this._flyout = null;
        this._createFlyout = createFlyout;

        var accounts = new Mail.QueryCollection(platform.accountManager.getConnectedAccountsByScenario, platform.accountManager,
            [ P.ApplicationScenario.mail, P.ConnectedFilter.normal, P.AccountSort.name ] );

        var items = this._items = new Mail.MappedCollection(accounts, function (account) {
            return new Mail.AccountItem(account, scheduler);
        });

        var list = this._list = new Jx.List();
        list.setSource(items);
        var ariaFlows = this._ariaFlows = new Mail.AriaFlows(list);

        var aggregator = this._aggregator = new Mail.AccountSwitcherAggregator(items);

        this.append(ariaFlows, aggregator);

        this._disposer = new Mail.Disposer(
            items,
            new Mail.EventHook(items, "collectionchanged", this._onCollectionChanged, this)
        );

        this._singleAccountHook = null;
        this._hookSingleAccountListener();

        Mail.log("AccountList_Ctor", Mail.LogEvent.stop);
    };

    Jx.augment(Mail.AccountSwitcher, Jx.Component);

    Mail.AccountSwitcher.prototype.shutdownComponent = function () {
        Jx.dispose(this._disposer);
        Jx.dispose(this._singleAccountHook);
        Jx.Component.prototype.shutdownComponent.call(this);
    };

    Mail.AccountSwitcher.prototype.getUI = function (ui) {
        var tooltip = Jx.escapeHtml(Jx.res.getString("mailAccountSwitcherTooltip")),
            singleAccountHasError = this._singleAccountHasError(),
            singleAccountHasOof = this._singleAccountHasOof(),
            singleAccountTooltip = singleAccountHasError ? Jx.escapeHtml(this._getSingleAccountErrorText()) :
                (singleAccountHasOof ? Jx.escapeHtml(Jx.res.getString("mailOofAccountListMessage")) : "");
        ui.html =
            "<div id='accountSwitcher' class='" +  (this._items.count <= 1 ? "singleAccount" : "") +
                (singleAccountHasError ? " singleAccountHasError" : "") +
                (singleAccountHasOof ? " singleAccountHasOof" : "") +"'>" +
                "<div class='listElement'>" +
                    "<div class='inhibitTouchHover'></div>" +
                    Jx.getUI(this._ariaFlows).html +
                "</div>" +
                "<div id='narrowAccountSwitcher'>" +
                    "<div id='accountSwitcherButton' tabIndex='0' role='button' title='" + tooltip + "' aria-label='" + tooltip + "'>" +
                        "<div class='icon-accountSwitcher'></div>" +
                        Jx.getUI(this._aggregator).html +
                    "</div>" +
                "</div>" +
                "<div id='narrowSingleAccountIndicator' role='status' title='" + singleAccountTooltip + "' aria-label='" + singleAccountTooltip + "'>" +
                    "<div class='singleAccountIcon icon-acSingleError'></div>" +
                    "<div class='singleAccountIcon icon-acSingleOof'></div>" +
                "</div>" +
            "</div>";
    };

    Mail.AccountSwitcher.prototype._singleAccountHasError = function () {
        var items = this._items;
        if (items.count === 1) {
            return items.item(0).hasError;
        }
        return false;
    };

    Mail.AccountSwitcher.prototype._getSingleAccountErrorText = function () {
        var items = this._items;
        if (items.count === 1) {
            return items.item(0).errorText;
        }
        return "";
    };

    Mail.AccountSwitcher.prototype._singleAccountHasOof = function () {
        var items = this._items;
        if (items.count === 1) {
            return items.item(0).hasOof;
        }
        return false;
    };

    Mail.AccountSwitcher.prototype._onSingleAccountChanged = function (ev) {
        var root = this._element;
        if (root) {
            if (Mail.Validators.havePropertiesChanged(ev, ["hasError", "hasOof"])) {
                var hasError = this._singleAccountHasError(),
                    hasOof = this._singleAccountHasOof();

                Jx.setClass(root, "singleAccountHasError", hasError);
                Jx.setClass(root, "singleAccountHasOof", hasOof);

                var tooltip = hasError ? this._getSingleAccountErrorText() :
                        (hasOof ? Jx.escapeHtml(Jx.res.getString("mailOofAccountListMessage")) : "");

                var indicator = root.querySelector("#narrowSingleAccountIndicator");
                indicator.setAttribute("title", tooltip);
                indicator.setAttribute("aria-label", tooltip);
            }
        }
    };

    Mail.AccountSwitcher.prototype.detachList = function () {
        Debug.assert(this._element);
        Debug.assert(this._listElement);
        Debug.assert(this._listElement.parentNode === this._element);

        this.removeChild(this._ariaFlows);
        this._element.removeChild(this._listElement);
        return { control: this._ariaFlows, element: this._listElement };
    };

    Mail.AccountSwitcher.prototype.attachList = function (content) {
        Debug.assert(this._ariaFlows === content.control);
        Debug.assert(this._listElement === content.element);
        Debug.assert(this._element);
        Debug.assert(content.element.parentNode !== this._element);

        this.appendChild(this._ariaFlows);
        this._element.appendChild(content.element);
    };

    Mail.AccountSwitcher.prototype.activateUI = function () {
        Jx.Component.prototype.activateUI.call(this);

        var element = this._element = document.querySelector("#accountSwitcher"),
            listElement = this._listElement = element.querySelector(".listElement"),
            switcherButton = this._switcherButton = element.querySelector("#accountSwitcherButton");

        this._hooks = new Mail.Disposer(
            new Jx.Clicker(listElement, this._onListClick, this),
            new Jx.PressEffect(element, ".accountItem, #accountSwitcherButton", [ "className" ], ".inhibitTouchHover"),
            new Jx.KeyboardNavigation(listElement, "vertical", this),
            new Jx.Clicker(switcherButton, this._onSwitcherButtonClick, this),
            Mail.EventHook.createGlobalHook("People.Accounts.AccountDialogEvents.newAccountAdded", this._onAccountSetup, this)
        );

        this._items.unlock();
    };

    Mail.AccountSwitcher.prototype.deactivateUI = function () {
        Jx.Component.prototype.deactivateUI.call(this);
        Jx.dispose(this._hooks);
    };

    Mail.AccountSwitcher.prototype.setFocus = function () {
        Debug.assert(Jx.isHTMLElement(this._element));
        Jx.safeSetActive(this._element);
    };

    Mail.AccountSwitcher.prototype.selectDefaultAccount = function () {
        if (this._items.count > 0) {
            this._selectItem(this._items.item(0), true /* synchronous */);
        }
    };

    Mail.AccountSwitcher.prototype._selectAccount = function (account, /*@optional*/synchronous) {
        Debug.assert(Jx.isObject(account));
        Debug.assert(Jx.isNullOrUndefined(synchronous) || Jx.isBoolean(synchronous));
        this._host.selectAccount(account, synchronous);

        var flyout = this._flyout;
        if (flyout) {
            flyout.hide();
        }
    };

    Mail.AccountSwitcher.prototype._hookSingleAccountListener = function () {
        var items = this._items;
        Jx.dispose(this._singleAccountHook);
        if (items.count === 1) {
            this._singleAccountHook = new Mail.EventHook(items.item(0), "changed", this._onSingleAccountChanged, this);
        } else {
            this._singleAccountHook = null;
        }
    };

    Mail.AccountSwitcher.prototype._onCollectionChanged = function (ev) {
        ///<param name="ev" type="P.CollectionChangedEventArgs"/>
        // Hide the account list when the user only has a single account and the account
        // doesn't have error or OOF state.
        Jx.setClass(this._element, "singleAccount", this._items.count <= 1);

        this._onSingleAccountChanged(["hasError", "hasOof"]);
        this._hookSingleAccountListener();

        if (ev.eType === ChangeType.itemRemoved) {
            // Update the selected item if the previous selection was removed
            if (this._selection.account.objectId === ev.objectId) {
                this.selectDefaultAccount();
            }
        } else if (ev.eType === ChangeType.itemAdded) {
            // Select the newly added account if setup has finished
            var accountItem = this._items.item(ev.index);
            if (Mail.AccountSettings.isSetupCompleted(accountItem.platformAccount)) {
                this._selectItem(accountItem);
            }
        } else if (ev.eType === ChangeType.reset) {
            this.selectDefaultAccount();
        }
    };

    Mail.AccountSwitcher.prototype._onAccountSetup = function (ev) {
        var account = ev.data.account;
        if (!Mail.Validators.areEqual(this._selection.account, account)) {
            this._selectAccount(account);
        }
    };

    Mail.AccountSwitcher.prototype._onListClick = function (/*@dynamic*/ev) {
        Mail.log("AccountList_onItemInvoked", Mail.LogEvent.start);

        var item = this._list.getTarget(ev);
        if (item) {
            // Let the item know about the click in case it needs to
            // handle error conditions (prompt fix password dialog)
            item.onClick();

            // Select the account that was clicked
            if (this._items.count > 1) {
                this._selectItem(item);
            }
        }
        Mail.log("AccountList_onItemInvoked", Mail.LogEvent.stop);
    };

    Mail.AccountSwitcher.prototype._onSwitcherButtonClick = function (ev) {
        Mail.log("AccountList_onSwitcherButtonClick", Mail.LogEvent.start);
        var flyout = this._flyout;
        if (!flyout) {
            flyout = this._flyout = new Mail.AccountSwitcherFlyout(this, this._createFlyout);
            this._disposer.add(flyout);
        }
        flyout.show(this._switcherButton, ev.type === "keydown");
        Mail.log("AccountList_onSwitcherButtonClick", Mail.LogEvent.stop);
    };

    Mail.AccountSwitcher.prototype._selectItem = function (accountItem, /*@optional*/synchronous) {
        this._selectAccount(accountItem.platformAccount, synchronous);
    };

    Mail.AccountSwitcher.prototype.flyoutBeforeShow = function () {
        this._switcherButton.classList.add("pressed");
    };

    Mail.AccountSwitcher.prototype.flyoutDismissed = function () {
        this._switcherButton.classList.remove("pressed");
    };

});

