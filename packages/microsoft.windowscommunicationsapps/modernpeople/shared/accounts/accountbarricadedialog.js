
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <disable>JS2076.IdentifierIsMiscased</disable>

Jx.delayDefine(People.Accounts, "AccountBarricadeDialog", function () {

    var P = window.People,
        A = window.People.Accounts,
        Plat = Microsoft.WindowsLive.Platform;

    var AccountBarricadeDialog = A.AccountBarricadeDialog = function (account, onCanceled) {
        /// <summary>Helper class for handling the connection requests for unknown or unsupported account types.</summary>
        /// <param name="account" type="Plat.Account"/>
        /// <param name="onCancelled" type="Function" optional="true"/>
        this._account = account;
        this._onCanceled = onCanceled;
        this._dialog = null;
    };

    AccountBarricadeDialog.prototype.showChooseAccountTypeDialog = function (onTypeSelected) {
        /// <summary>Launch a dialog asking the user if the account is of type EAS, IMAP.</summary>
        /// <param name="onTypeSelected" type="Function"/>
        var dialogContent = new ChooseAccountTypeDialogContent(this._account);
        var dialog = this._createDialog(dialogContent);

        var onAdd = function () {
            onTypeSelected.call(null, dialogContent.accountType);
        };

        dialogContent.addButton = this._addActionButton("idBarDlgAddButton", "actdlgAdd", onAdd, "submit");
        dialog.buttons.push(new P.CloseButton("idBarDlgCancelButton", getString("actdlgCancel"), dialog));

        // It's possible that we'll fail to launch the dialog, because there's already some active dialog,
        // in which case addButton.disable will fail.
        if (dialog.show(true/*escapable*/)) {
            dialogContent.addButton.disabled = "disabled"; // disable the "add" button by default.
        }
    };

    AccountBarricadeDialog.prototype.showIsEasDialog = function (onYes, onNo) {
        /// <summary>Launches a dialog asking the user specifically if the account is an EAS account</summary>
        /// <param name="onYes" type="Function"/>
        /// <param name="onNo" type="Function"/>
        var dialog = this._createDialog(new VerifyEasDialogContent(this._account));

        var yesButton = this._addActionButton("idBarDlgYesButton", "barDlgYesButton", onYes, "submit");
        this._addActionButton("idBarDlgNoButton", "barDlgNoButton", onNo);

        yesButton.autofocus = true;

        dialog.show(true/*escapable*/);
    };

    AccountBarricadeDialog.prototype.showPopNotSupportedDialog = function (entryPoint, emailAddress) {
        /// <summary>Launches a dialog indicating that POP accounts cannot be connected locally.</summary>
        /// <param name="entryPoint" type="String">This is used for bici</param>
        /// <param name="emailAddress" type="String" optional="true">This is used for bici</param>
        var dialog = this._createDialog(new PopNotSupportedDialogContent());

        dialog.buttons.push(new P.CloseButton("idBarDlgCancelButton", getString("actdlgCancel"), dialog));

        dialog.show(true/*escapable*/);

        // Log that we failed to create a POP account to the accountDialogOverall
        var server = "";
        if (Jx.isNonEmptyString(emailAddress)) {
            var emailParts = emailAddress.split("@");
            if (emailParts.length > 1) {
                emailParts.shift();
                server = emailParts.join("");
            }
        }
        Jx.bici.addToStream(Microsoft.WindowsLive.Instrumentation.Ids.Platform.accountDialogOverall, "POP", server, P.Bici.SyncProtocol.pop, Plat.Result.cannotCreatePopAccounts, P.Bici.ConfigSource.pop, entryPoint);
    };

    AccountBarricadeDialog.prototype.showGmailDowngradeDialog = function (platform) {
        /// <summary>Dialog to notify a user that his GMail account no longer supports EAS. And gives
        /// him the option to "recconect" the account, which will really just delete the old one 
        /// and launch the AccountDialog with a Gmail IMAP upsell.</summary>
        /// <param name="platform" type="Plat.Client"/>
        Debug.assert(!Jx.isNullOrUndefined(platform));
        Debug.assert(!Jx.isNullOrUndefined(this._account));
        Debug.assert(this._account.accountType === Plat.AccountType.eas, "This dialog must only be launched for Gmail EAS accounts");

        var account = this._account;
        var accountSourceId = (account.sourceId === "EXCH") ? "GOOG" : account.sourceId;
        var accountForHeader = platform.accountManager.getAccountBySourceId(accountSourceId, "") || account;

        var headerColor;
        var titleColor;
        var hexColor = accountForHeader.color.toString(16);
        if (accountForHeader.color !== 0 && hexColor !== "ffffffff") {
            // We're not going to show the default grey header color. Use white as
            // the title color.
            headerColor = "#" + hexColor;
            titleColor = "White";
        }

        var theme = { headerColor: headerColor, headerIcon: accountForHeader.iconMediumUrl || account.iconMediumUrl, titleColor: titleColor };

        var emailAddress = account.emailAddress;
        var dialog = this._createDialog(new GmailDowngradeDialogContent(account), getString("barDlgGmailDowngradeDlgTitle"), theme);

        var onReconnect = /*@bind(AccountBarricadeDialog)*/function () {
            // The user has opted to proceed with the downgrade. Ensure that the EAS account can be deleted before proceeding.
            Debug.assert(account.canDelete);
            if (account.canDelete) {

                // Fetch the Gmail IMAP upsell.
                var upsell = platform.accountManager.getAccountBySourceId("GOOG", "");
                if (upsell) {
                    if (upsell.accountType !== Plat.AccountType.imapAccountFactory) {
                        var otherSupportedUpsells = upsell.getOtherConnectableAccounts(Plat.ApplicationScenario.mail);
                        upsell = null;

                        if (otherSupportedUpsells && otherSupportedUpsells.count > 0) {
                            for (var i = 0; i < otherSupportedUpsells.count; i++) {
                                var otherUpsell = otherSupportedUpsells.item(i);
                                if (otherUpsell && otherUpsell.accountType === Plat.AccountType.imapAccountFactory) {
                                    // IMAP upsell found.
                                    upsell = otherUpsell;
                                    break;
                                }
                            }
                        }
                    }
                }

                if (upsell) {
                    var accountDlg = new A.AccountDialog(upsell, A.AccountDialogMode.add, Plat.ApplicationScenario.mail, platform, "", emailAddress);
                    if (accountDlg.show()) {
                        // Delete the old EAS account from all locations.
                        account.deleteObject();
                        this._account = account = null;
                    }
                } else {
                    Jx.log.error("Failed to downgrade Gmail account. Could not load the Gmail upsell.");
                }
                
            } else {
                Jx.log.error("Failed to downgrade Gmail account, 'this._account.canDelete' was false.");
            }
        }.bind(this);

        var reconnect = this._addActionButton("idBarDlgYesButton", "barDlgReconnectBtn", onReconnect, "submit");
        dialog.buttons.push(new P.CloseButton("idBarDlgCancelButton", getString("actdlgCancel"), dialog));

        reconnect.autofocus = true;

        dialog.show(true/*escapable*/);
    };

    AccountBarricadeDialog.prototype._createDialog = function (content, title, theme) {
        /// <summary>Create a new Dialog with the given content.</summary>
        /// <param name="content" type="Jx.Component">The UI for the dialog.</param>
        /// <param name="title" type="String" optional="true">Optional alternative title for the dialog.</param>
        /// <param name="theme" type="Object" optional="true">Used to theme the dialog differently from the default colors.</param>
        var headerOptions = theme || { useAppTheme: true };
        var dialog = this._dialog = new P.Dialog(title || getString("barDlgTitle"), content, headerOptions);
        dialog.addListener("closed", this._onDialogClosed, this);
        return dialog;
    };

    AccountBarricadeDialog.prototype._addActionButton = function (id, resId, callback, buttonType) {
        /// <summary>Create a new DailogButton and adds it to the current dialog.</summary>
        /// <param name="id" type="String">The Id for the button</param>
        /// <param name="resId" type="String">The resource Id for button's label</param>
        /// <param name="callback" type="Function">The function to invoke when the button is clicked.</param>
        /// <param name="buttonType" type="String" optional="true"/>
        Debug.assert(this._dialog);
        var dialog = this._dialog;

        var button = new P.DialogButton(id, getString(resId), buttonType);
        button.addListener("click", function () {
            dialog.removeListener("closed", this._onDialogClosed, this);
            dialog.close();
            callback.call();
            this._dialog = null;
        }, this);
        dialog.buttons.push(button);
        return button;
    };

    AccountBarricadeDialog.prototype._onDialogClosed = function () {
        if (Jx.isFunction(this._onCanceled)) {
            this._onCanceled.call();
        }
        this._dialog = null;
    };

    //
    // ChooseAccountTypeDialogContent
    //
    var ChooseAccountTypeDialogContent = function (account) {
        this.initComponent();
        this._account = account;
        this._addButton = null;
        this._cachedType = null;
    };
    Jx.augment(ChooseAccountTypeDialogContent, Jx.Component);

    ChooseAccountTypeDialogContent.prototype.getUI = function (ui) {
        var email = this._account.emailAddress;
        var title = (Jx.isNonEmptyString(email) ? getCompoundString("barDlgChooseAccountTypeTitleWithEmail", Jx.escapeHtml(email)) : getString("barDlgChooseAccountTypeTitle"));

        ui.html =
                "<div class='barDlgContent'>" +
                    "<div id='dlgDescription' class='barDlgChild' role='heading'>" + title + "</div>" +
                    "<div id='accountTypeOptions' class='barDlgChild'>" +
                        "<label><input id='barDlgEas' type='radio' value='" + Plat.AccountType.easAccountFactory + "'>" + getString("barDlgEasLabel") + "</label>" +
                        "<label><input id='barDlgImap' type='radio' value='" + Plat.AccountType.imapAccountFactory + "'>" + getString("barDlgImapLabel") + "</label>" +
                    "</div>" +
                    "<div id='accountUnsupported'><a href='http://go.microsoft.com/fwlink/?LinkId=259186'>" + getString("barDlgUnsupportedAccountTypes") + "</a></div>" +
                "</div>";
    };

    ChooseAccountTypeDialogContent.prototype.activateUI = function () {
        Debug.assert(this._addButton);

        // Ensure that the user doesn't have the option of proceeding until they explicitly select
        // the account-type.
        Array.prototype.forEach.call(document.querySelectorAll("#accountTypeOptions input[type='radio']"), function (radio) {
            radio.name = "accountType";
            radio.addEventListener("change", function () {
                if (radio.checked) {
                    this._addButton.disabled = "";
                }
            } .bind(this));
        }, this);

        // Set default focus on the first radio-button
        Jx.safeSetActive(document.getElementById("barDlgEas"));

        Jx.Component.prototype.activateUI.call(this);
    };

    ChooseAccountTypeDialogContent.prototype.shutdownUI = function () {
        this._cachedType = this.accountType;

        Jx.Component.prototype.shutdownUI.call(this);
    };

    Object.defineProperty(ChooseAccountTypeDialogContent.prototype, "addButton", {
        get: function () { return this._addButton; },
        set: function (value) { this._addButton = value; }
    });

    Object.defineProperty(ChooseAccountTypeDialogContent.prototype, "accountType", {
        get: function () {
            var selectedRadioButton = (this.hasUI() ? document.querySelector("#accountTypeOptions input[type='radio']:checked") : null);
            return (selectedRadioButton ? parseInt(selectedRadioButton.value) : this._cachedType);
        }
    });

    //
    // PopNotSupportedDialogContent
    //
    var PopNotSupportedDialogContent = function (account) {
        this.initComponent();
        this._account = account;
    };
    Jx.augment(PopNotSupportedDialogContent, Jx.Component);

    PopNotSupportedDialogContent.prototype.getUI = function (ui) {
        ui.html =
                "<div class='barDlgContent'>" +
                    "<div id='dlgDescription' role='heading'>" + getString("barDlgPopNotSupported") + "</div>" +
                    "<div>" + getString("barDlgIdUsingPopInstructions") + "</div>" +
                    "<div><a href='http://g.live.com/9ep9gl/popmail'>" + getString("barDlgUsingPopLink") + "</a></div>" +
                "</div>";
    };

    PopNotSupportedDialogContent.prototype.activateUI = function () {
        var link = document.querySelector(".barDlgContent a");
        Jx.safeSetActive(link);

        Jx.Component.prototype.activateUI.call(this);
    };

    //
    // VerifyEasDialogContent
    //
    var VerifyEasDialogContent = function (account) {
        this.initComponent();
        this._account = account;
    };
    Jx.augment(VerifyEasDialogContent, Jx.Component);

    VerifyEasDialogContent.prototype.getUI = function (ui) {
        ui.html =
                "<div class='barDlgContent'>" +
                    "<div id='dlgDescription' role='heading'>" + getCompoundString("barDlgVerifyEasTitle", Jx.escapeHtml(this._account.emailAddress)) + "</div>" +
                "</div>";
    };

    //
    // GmailDowngradeDialogContent
    //
    var GmailDowngradeDialogContent = function (account) {
        this.initComponent();
        this._account = account;
    };
    Jx.augment(GmailDowngradeDialogContent, Jx.Component);

    GmailDowngradeDialogContent.prototype.getUI = function (ui) {
        ui.html =
                "<div class='barDlgContent'>" +
                    "<div id='dlgDescription' role='heading'>" + getCompoundString("barDlgGmailDowngradeDlgExplanation", Jx.escapeHtml(this._account.emailAddress)) + "</div>" +
                "</div>";
    };

    function getString(id) { return Jx.res.getString("/accountsStrings/" + id); };
    function getCompoundString(id, values) { return Jx.res.loadCompoundString("/accountsStrings/" + id, values); }

});
