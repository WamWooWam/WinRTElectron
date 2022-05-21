
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*jshint browser:true*/
/*globals Debug,Jx,Mail,Microsoft,People,WinJS,Windows*/
Jx.delayDefine(Mail, "WelcomeMessage", function () {
    "use strict";

    var Plat = Microsoft.WindowsLive.Platform;

    var WelcomeMessage = Mail.WelcomeMessage = function (host, selection, animator, settings, componentsToDisable, commandManager) {
        Debug.assert(Jx.isObject(host));
        Debug.assert(Jx.isObject(selection));
        Debug.assert(Jx.isObject(animator));
        Debug.assert(Jx.isObject(settings));
        Debug.assert(Jx.isArray(componentsToDisable));
        Debug.assert(Jx.isObject(commandManager));

        this.initComponent();
        this._host = host;
        this._selection = selection;
        this._animator = animator;
        this._settings = settings;
        this._componentsToDisable = componentsToDisable;
        this._commandManager = commandManager;
        this._disposer = null;
        this._content = null;
    };
    Jx.augment(WelcomeMessage, Jx.Component);
    var prototype = WelcomeMessage.prototype;

    prototype.hasUI = function () {
        return true;
    };

    prototype.onActivateUI = function () {
        var selection = this._selection;
        this._disposer = new Mail.Disposer(new Mail.EventHook(selection, "navChanged", this._onNavChanged, this));
        this._check(selection.account);
    };

    prototype.onDeactivateUI = function () {
        Jx.dispose(this._disposer);
    };

    prototype._onNavChanged = function (ev) {
        if (this._content) {
            this._dismiss();
        }

        if (ev.accountChanged) {
            this._check(ev.target.account);
        }
    };

    prototype._check = function (account) {
        Debug.assert(Jx.isNullOrUndefined(account) || Jx.isInstanceOf(account, Mail.Account));

        if (account) {
            var settings = this._settings;
            if (!settings.dismissedWelcomeMessage) {

                var accounts = account.platform.accountManager.getConnectedAccountsByScenario(
                    Plat.ApplicationScenario.mail, Plat.ConnectedFilter.normal, Plat.AccountSort.name);
                var hasMultipleAccounts = accounts.count > 1;
                accounts.dispose();
                
                if (hasMultipleAccounts || account.accountType === Plat.AccountType.imap) {
                    // No welcome message, now or later, if the user has multiple mail accounts already,
                    // or if the first selected account is IMAP
                    settings.dismissedWelcomeMessage = true;
                } else {
                    this._show(account);
                }
            }
        }
    };

    prototype._show = function (account) {
        // Disable the appbar and hidden components (messagelist, reading pane)
        Debug.assert(Jx.isInstanceOf(account, Mail.Account));
        Debug.assert(!this._content);

        this._commandManager.disableCommands("welcomeMessage");
        this._componentsToDisable.forEach(function (component) {
            component.setEnabled(false);
        });

        var content = this._content = new Mail.WelcomeMessageContent(account, this._selection, this._animator);
        this._host.hostComponent(content);
    };

    prototype._dismiss = function () {
        Debug.assert(this._content);

        var content = this._content;
        if (content) {
            this._settings.dismissedWelcomeMessage = true;

            content.close();
            this._content = null;

            this._commandManager.enableCommands("welcomeMessage");
            this._componentsToDisable.forEach(function (component) {
                component.setEnabled(true);
            });
        }
    };
});

Jx.delayDefine(Mail, "WelcomeMessageContent", function () {
    "use strict";

    var Plat = Microsoft.WindowsLive.Platform;

    var WelcomeMessageContent = Mail.WelcomeMessageContent = function (account, selection, animator) {
        Debug.assert(Jx.isInstanceOf(account, Mail.Account));
        Debug.assert(Jx.isObject(selection));
        Debug.assert(Jx.isObject(animator));

        this.initComponent();
        this._account = account;
        this._selection = selection;
        this._animator = animator;

        this._element = null;
        this._hooks = null;
    };
    Jx.augment(WelcomeMessageContent, Jx.Component);
    var prototype = WelcomeMessageContent.prototype;

    prototype.getUI = function (ui) {
        var buttons = [
            { name: "addAccount", text: "mailFirstRunAddAccountButton" },
            { name: "inbox", text: "mailFirstRunInboxButton" }
        ];

        ui.html =
            "<div id='" + this._id + "' class='welcomeMessage'>" +
                "<div class='welcomeMessageContent'>" +
                    "<div class='heading'>" +
                        Jx.escapeHtml(Jx.res.getString("mailFirstRunHeading")) +
                    "</div>" +
                    "<div class='buttons'>" +
                        buttons.reduce(function (html, button, index) {
                            return html +
                                "<button class='" +
                                    button.name +
                                    ((index === 0) ? " defaultButton" : "") +
                                    " button" +
                                "'>" +
                                    Jx.escapeHtml(Jx.res.getString(button.text)) +
                                "</button>";
                        }, "") +
                    "</div>" +
                "</div>" +
            "</div>";
    };

    prototype.onActivateUI = function () {
        var element = this._element = document.getElementById(this._id),
            content = element.querySelector(".welcomeMessageContent"),
            inboxButton = content.querySelector(".inbox"),
            addAccountButton = content.querySelector(".addAccount");
        this._hooks = new Mail.Disposer(
            new Mail.EventHook(inboxButton, "click", this._onInboxClick, this),
            new Mail.EventHook(addAccountButton, "click", this._onAddAccountClick, this)
        );
        this._animator.setWelcomeMessageElement(content);
    };

    prototype.onDeactivateUI = function () {
        Jx.dispose(this._hooks);
    };

    prototype.close = function () {
        this._animator.setWelcomeMessageElement(null);
        WinJS.UI.Animation.exitContent(this._element).done(this._cleanup.bind(this));
    };

    prototype._cleanup = function () {
        var parentComponent = this.getParent();
        if (parentComponent) {
            parentComponent.removeChild(this);
        }

        this.shutdownUI();
        this.shutdownComponent();
    };

    prototype._onInboxClick = function () {
        this._selection.updateNav(this._account, this._account.inboxView);
    };

    prototype._onAddAccountClick = function (ev) {
        People.Accounts.showAccountSettingsPage(
            this._account.platform,
            Plat.ApplicationScenario.mail,
            People.Accounts.AccountSettingsPage.upsells,
            { launchedFromApp: true }
        );
        ev.preventDefault();
    };
});
