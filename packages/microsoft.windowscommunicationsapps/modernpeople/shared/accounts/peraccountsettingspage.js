
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*jshint browser:true */
/*global Jx,Debug,People,Microsoft,Windows,WinJS*/

Jx.delayDefine(People.Accounts, "PerAccountSettingsPage", function () {

    var P = window.People;
    var A = P.Accounts;
    var Plat = Microsoft.WindowsLive.Platform;
    var Crypto = Windows.Security.Cryptography;
    var O = Windows.Security.Authentication.OnlineId;
    var N = Windows.UI.Notifications;

    var PerAccountSettingsPage = A.PerAccountSettingsPage = /* @constructor */function (platform, account, scenario, jobset, delayFocusSetting) {
        // <summary>Constructor</summary>
        // <param name="platform" type="Plat.Client"/>
        // <param name="account" type="Plat.Account"/>
        // <param name="scenario" type="Plat.ApplicationScenario"/>
        // <param name="jobset" type="P.JobSet" optional="true"/>
        // <param name="delayFocusSetting" type="Boolean" optional="true"/>
        Debug.assert(Jx.isObject(platform), "The platform object is non-optional");
        Debug.assert(Jx.isObject(account), "The account object is non-optional");
        Debug.assert(Jx.isNumber(scenario), "The scenario object is non-optional");
        A.AccountControlBase.call(this, platform, scenario);

        this._account = /*@static_cast(Plat.Account)*/account;
        this._platform = /*@static_cast(Plat.Client)*/platform;
        this._scenario = scenario;
        this._specialFoldersControl = new SpecialFoldersControl(platform, account);
        this._certificateSettingsControl = new A.CertificateSettingsControl(platform, account);
        this._jobset = jobset ? jobset.createChild() : (new P.Scheduler()).getJobSet();
        this._delayFocusSetting = delayFocusSetting;

        this.append(this._specialFoldersControl, this._certificateSettingsControl);
        this.initComponent();
    };
    Jx.augment(PerAccountSettingsPage, Jx.Component);
    Jx.augment(PerAccountSettingsPage, A.AccountControlBase);

    var SyncInterval = {
        push: 0,
        manual: 1,
        poll15: 15,
        poll30: 30,
        poll60: 60
    };
    Object.freeze(SyncInterval);

    Object.defineProperty(PerAccountSettingsPage.prototype, "accountName", { get: function () { return this._inputs.accountName.value; } });

    PerAccountSettingsPage.prototype._getBiciSuffix = function () {
        return "settings";
    };

    // Jx.Component
    PerAccountSettingsPage.prototype.getUI = function (ui) {
        /// <summary>Gets the UI string for the component.</summary>
        /// <param name="ui" type="Object">Returns the object which contains html and css properties.</param>
        this._id = "idPerAccountSettingsPage" + Jx.uid();
        var account = this._account;
        var easSettings = account.getServerByType(Plat.ServerType.eas);
        var settings = easSettings || account.getServerByType(Plat.ServerType.imap) || { server: "", domain: "", userId: "", port: 0, useSsl: true };
        var smtpSettings = account.getServerByType(Plat.ServerType.smtp) || { server: "", userId: "", port: 0, useSsl: true, serverRequiresLogin: false, hasPasswordCookie: false, usesMailCredentials: false };
        var localAccount = (account.getConfigureType(this._scenario) === Plat.ConfigureType.editOnClient);
        var isImap = (account.accountType === Plat.AccountType.imap);
        var isEas = (account.accountType === Plat.AccountType.eas);
        var passwordAuth = account.authType === Plat.AccountAuthType.password;
        var showSmtpCredControls = (isImap && !smtpSettings.usesMailCredentials && passwordAuth);
        var isHotmail = easSettings && easSettings.isWlasSupported;

        ui.html =
            "<div id='" + this._id + "'>" +
            "<div id='pasAccountStatus' data-easOrImapOnly='true' role='status' class='hidden pas-inlineAdvise pas-tooltipCheck'>" + getString("pasCatchAllError") + "</div>" +
        /*Account Name*/
                "<label id='pasAccountNameLabel' data-easOrImapOnly='false' class='pas-tooltipCheck'>" + getString("pasAccountNameLabel") + "</label>" +
                "<div data-easOrImapOnly='false'><input id='pasAccountName' aria-labelledby='pasAccountNameLabel' type='text' value='" + Jx.escapeHtml(account.displayName) + "' maxlength='129' " + (localAccount ? "" : "readonly") + " tabIndex='0'></div>" +
        /*IMAP User Display Name (Your Name)*/
                "<label id='pasUserDisplayNameLabel' data-imapOnly='true' class='pas-tooltipCheck'>" + getString("actdlgDisplayNameLabel") + "</label>" +
                "<div data-imapOnly='true'><input id='pasUserDisplayName' aria-labelledby='pasUserDisplayNameLabel' type='text' value='" + Jx.escapeHtml(account.userDisplayName) + "' maxlength='129'></div>" +
        /*Sync-interval*/
                "<div id='pasSyncIntevalStatus' data-easOrImapOnly='true' role='status' class='hidden pas-inlineAdvise pas-tooltipCheck'></div>" +
                "<label id='pasSyncIntervalLabel' data-easOrImapOnly='true' class='pas-tooltipCheck' >" + getString("pasSyncIntervalLabel") + "</label>" +
                "<div data-easOrImapOnly='true'><select id='pasSyncInterval' aria-labelledby='pasSyncIntervalLabel'></select></div>" +
        /*Sync-window*/
                "<div data-requiresMail='true' data-easOrImapOnly='true'>" +
                    "<label id='pasSyncWindowLabel' class='pas-tooltipCheck'>" + getString("pasSyncWindowLabel") + "</label>" +
                    "<select id='pasSyncWindow' aria-labelledby='pasSyncWindowLabel'>" +
                        "<option value='" + Plat.SyncWindowSize.threeDays + "'>" + getString("pasSyncWindow3Days") + "</option>" +
                        "<option value='" + Plat.SyncWindowSize.oneWeek + "'>" + getString("pasSyncWindow7Days") + "</option>" +
                        "<option value='" + Plat.SyncWindowSize.twoWeeks + "'>" + getString("pasSyncWindow2Weeks") + "</option>" +
                        "<option value='" + Plat.SyncWindowSize.oneMonth + "'>" + getString("pasSyncWindowMonth") + "</option>" +
                        "<option value='" + Plat.SyncWindowSize.all + "'>" + getString("pasSyncWindowAll") + "</option>" +
                    "</select>" +
                "</div>" +
        /*Content to sync*/
                "<div id='pasContentToSync' class='pas-checkboxGroup' data-easOrImapOnly='true' >" +
                    "<label id='pasEnabledContentLabel' class='pas-tooltipCheck'>" + getString("pasEnabledContentLabel") + "</label>" +
                    "<div class='pas-checkbox'><label><input id='pasContentTypeEmail' type='checkbox' aria-label='" + Jx.escapeHtml(getString("pasContentTypeEmail")) + "'>" + getString("pasContentTypeEmail") + "</label></div>" +
                    "<div class='pas-checkbox'><label><input id='pasContentTypeContacts' type='checkbox' aria-label='" + Jx.escapeHtml(getString("pasContentTypeContacts")) + "'>" + getString("pasContentTypeContacts") + "</label></div>" +
                    "<div class='pas-checkbox'><label><input id='pasContentTypeCalendar' type='checkbox' aria-label='" + Jx.escapeHtml(getString("pasContentTypeCalendar")) + "'>" + getString("pasContentTypeCalendar") + "</label></div>" +
                "</div>" +
        /*Enable categories*/
                "<div id='pasOrganizeYourMail' data-requiresMail='true' data-easOnly='true' class='pas-checkboxGroup'>" +
                        "<label class='pas-tooltipCheck'>" + getString("pasOrganizeYourMailLabel") + "</label>" +
                        "<div class='pas-checkbox'><label><input id='pasNewsletterView' type='checkbox' aria-label='" + Jx.escapeHtml(getString("pasNewsletterView")) + "'>" + getString("pasNewsletterView") + "</label></div>" +
                        "<div class='pas-checkbox'><label><input id='pasSocialUpdatesView' type='checkbox' aria-label='" + Jx.escapeHtml(getString("pasSocialUpdatesView")) + "'>" + getString("pasSocialUpdatesView") + "</label></div>" +
                "</div>" +
        /*Enable toast*/
                "<div data-requiresMail='true' data-easOrImapOnly='true'>" +
                    "<div id='pasEnableToastInstructions' role='status' class='hidden pas-inlineAdvise pas-tooltipCheck'>" + getString("pasEnableToastsInstructions") + "</div>" +
                    "<label id='pasEnableToastsLabel' class='pas-tooltipCheck'>" + getString("pasEnableToastsLabel") + "</label>" +
                    "<select id='pasEnableToast' aria-labelledby='pasEnableToastsLabel'>" +
                        "<option value='" + Plat.ToastState.all + "'>" + getString("pasEnableToastsAllEmailLabel") + "</option>" +
                        "<option value='" + Plat.ToastState.favoritesOnly + "'>" + getString("pasEnableToastsFavoritesOnlyLabel") + "</option>" +
                        "<option value='" + Plat.ToastState.none + "'>" + getString("pasEnableToastsNeverLabel") + "</option>" +
                    "</select>" +
                "</div>" +
        /*External Images*/
                "<div data-easOrImapOnly='true' data-requiresMail='true' class='pas-toggle'><div id='pasEnableExternalImages' data-win-control='WinJS.UI.ToggleSwitch' data-win-options='{title:&quot;" + Jx.escapeHtml(getString("pasEnableExternalImagesLabel")) + "&quot;, labelOn:&quot;" + Jx.escapeHtml(getString("pasOnLabel")) + "&quot;, labelOff:&quot;" + Jx.escapeHtml(getString("pasOffLabel")) + "&quot; }'></div></div>" +
        /*Email Signature*/
                "<div data-requiresMail='true' data-easOrImapOnly='true'>" +
                    "<div id='pasEnableSignature' data-win-control='WinJS.UI.ToggleSwitch' data-win-options='{title:&quot;" + Jx.escapeHtml(getString("pasUseSignatureLabel")) + "&quot;, labelOn:&quot;" + Jx.escapeHtml(getString("pasYesLabel")) + "&quot;, labelOff:&quot;" + Jx.escapeHtml(getString("pasNoLabel")) + "&quot; }'></div>" +
                    "<div class='pas-textarea'><textarea id='pasSignature' rows='5' maxlength='8000' aria-label='" + Jx.escapeHtml(getString("pasUseSignatureLabel")) + "' disabled></textarea></div>" +
                "</div>" +
        /*Autoreply*/
                "<div data-requiresMail='true' data-easOofSupportedOnly='true'>" +
                    "<div class='pas-toggle'>" + 
                        "<div id='pasEnableAutoreply' aria-label='" + Jx.escapeHtml(getString("pasEnableAutoreplyAriaLabel")) + "' data-win-control='WinJS.UI.ToggleSwitch' data-win-options='{title:&quot;" + Jx.escapeHtml(getString("pasEnableAutoreplyLabel")) + "&quot;, labelOn:&quot;" + Jx.escapeHtml(getString("pasOnLabel")) + "&quot;, labelOff:&quot;" + Jx.escapeHtml(getString("pasOffLabel")) + "&quot; }'></div>" +
                    "</div>" +
                    "<div id='pasAutoreplyDetails'>" + 
                        "<div class='pas-settingGroup'>" + 
                            "<label id='pasAutoreplyMessageTitle' class='pas-tooltipCheck" + (isHotmail ? " hidden" : "") + "'>" + getString("pasAutoreplyForInternalExchangeLabel") + "</label>" +
                            "<div class='pas-textarea'><textarea id='pasAutoreplyMessage' rows='5' maxlength='" + (isHotmail ? "800" : "64000") + "' aria-label='" + Jx.escapeHtml(getString("pasAutoreplyMessageLabel")) + "' placeholder='" + Jx.escapeHtml(getString("pasAutoreplyHintMessage")) + "'></textarea></div>" +
                        "</div>" +
                        "<div class='pas-settingGroup'>" + 
                            "<div class='pas-checkbox'><label><input id='pasAutoreplyForKnownCheck' type='checkbox' aria-label='" + Jx.escapeHtml(getString(isHotmail ? "pasEnableAutoreplyForKnownOnlyHotmailLabel" : "pasEnableAutoreplyForExternalExchangeLabel")) + "'>" + getString(isHotmail ? "pasEnableAutoreplyForKnownOnlyHotmailLabel" : "pasEnableAutoreplyForExternalExchangeLabel") + "</label></div>" +
                            "<div class='pas-textarea'><textarea id='pasAutoreplyMessageExternal' rows='5' maxlength='64000' aria-label='" + Jx.escapeHtml(getString("pasAutoreplyMessageLabel")) + "' placeholder='" + Jx.escapeHtml(getString("pasAutoreplyHintMessage")) + "'></textarea></div>" +
                        "</div>" +
                    "</div>" +
                "</div>" +       
        /*Email Address*/
                "<div id='pasCredentialStatus' data-easOrImapOnly='true' role='status' class='hidden pas-inlineAdvise pas-tooltipCheck'>" + getString("pasBadCredentialsError") + "</div>" +
                "<label id='pasPreferredEmailLabel' data-easOrImapOnly='false' class='pas-tooltipCheck'>" + getString("pasPreferredEmailLabel") + "</label>" +
                "<div data-easOrImapOnly='false'><select id='pasPreferredEmail' aria-labelledby='pasPreferredEmailLabel'></select></div>" +
        /*Password*/
                "<label id='pasPasswordLabel' data-easOrImapOnly='true' class='" + (!passwordAuth ? "hidden" : "pas-tooltipCheck") + "' >" + getString("pasPasswordLabel") + "</label>" +
                "<div data-easOrImapOnly='true' class='" + (!passwordAuth ? "hidden" : "") + "'><input id='pasPassword' aria-labelledby='pasPasswordLabel' type='password' value='" + (settings.hasPasswordCookie ? "********" : "") + "' maxlength='256'></div>" +
        /*Domain*/
                "<label id='pasDomainLabel' data-easAdvancedOnly='true' class='pas-tooltipCheck'>" + getString("pasDomainLabel") + "</label>" +
                "<div data-easAdvancedOnly='true'><input id='pasDomain' aria-labelledby='pasDomainLabel' type='text' value='" + Jx.escapeHtml(settings.domain) + "' maxlength='256'></div>" +
        /*Username*/
                "<label id='pasUsernameLabel' data-easOrImapAdvancedOnly='true' class='" + (!passwordAuth ? "hidden" : "pas-tooltipCheck") + "'>" + getString("pasUsernameLabel") + "</label>" +
                "<div data-easOrImapAdvancedOnly='true' class='" + (!passwordAuth ? "hidden" : "") + "'><input id='pasUsername' aria-labelledby='pasUsernameLabel' type='text' value='" + Jx.escapeHtml(settings.userId) + "' maxlength='256'></div>" +
        /*Server and Port*/
                "<div data-easOrImapAdvancedOnly='true' class='" + (isImap ? "serverAndPortLeft" : "") + "'>" +
                    "<div class='singleLineText' ><label id='pasServerLabel' class='pas-tooltipCheck'>" + (isImap ? getString("pasImapServerLabel") : getString("pasServerLabel")) + "</label></div>" +
                    "<input id='pasServer' aria-labelledby='pasServerLabel' type='url' value='" + Jx.escapeHtml(settings.server) + "' maxlength='256'>" +
                "</div>" +
                "<div data-imapAdvancedOnly='true' class='serverAndPortRight " + (!isImap ? "hidden" : "") + "'>" +
                    "<div class='singleLineText'><label id='pasImapPortLabel' class='pas-tooltipCheck'>" + getString("pasPortLabel") + "</label></div>" +
                    "<input id='pasImapPort' aria-labelledby='pasImapPortLabel' type='number' value='" + String(settings.port) + "' maxlength='5'>" +
                "</div>" +
                "<div class='clear'></div>" +
        /*Use SSL*/
                "<div data-easOrImapAdvancedOnly='true' class='pas-checkbox pas-settingGroup'><label><input id='pasUseSsl' type='checkbox' " + (isEas ? "disabled" : "") + " aria-label='" + Jx.escapeHtml(getString("pasUseSslLabel")) + "' " + (settings.useSsl ? "checked" : "") + ">" + getString("pasUseSslLabel") + "</label></div>" +
        /*SMTP Server and Port*/
                "<div data-imapAdvancedOnly='true' class='serverAndPortLeft'>" +
                    "<div class='singleLineText'><label id='pasSmtpServerLabel' class='pas-tooltipCheck'>" + getString("pasSmtpServerLabel") + "</label></div>" +
                    "<input id='pasSmtpServer' aria-labelledby='pasSmtpServerLabel' type='url' value='" + Jx.escapeHtml(smtpSettings.server) + "' maxlength='256'>" +
                "</div>" +
                "<div data-imapAdvancedOnly='true' class='serverAndPortRight'>" +
                    "<div class='singleLineText'><label id='pasSmtpPortLabel' class='pas-tooltipCheck'>" + getString("pasPortLabel") + "</label></div>" +
                    "<input id='pasSmtpPort' aria-labelledby='pasSmtpPortLabel' type='number' value='" + String(smtpSettings.port) + "' maxlength='5'>" +
                "</div>" +
                "<div class='clear'></div>" +
                "<div class='pas-settingGroup'>" +
            /*Use SSL (SMTP)*/
                    "<div data-imapAdvancedOnly='true' class='pas-checkbox'><label><input id='pasSmtpUseSsl' type='checkbox' aria-label='" + Jx.escapeHtml(getString("pasUseSslLabel")) + "' " + (smtpSettings.useSsl ? "checked" : "") + ">" + getString("pasUseSslLabel") + "</label></div>" +
            /*SMTP Requires Auth*/
                    "<div data-imapAdvancedOnly='true' class='pas-checkbox " + (!passwordAuth ? "hidden" : "") + "'><label><input id='pasSmtpRequiresAuth' type='checkbox' aria-label='" + Jx.escapeHtml(getString("pasSmtpRequiresAuthLabel")) + "' " + (smtpSettings.serverRequiresLogin ? "checked" : "") + ">" + getString("pasSmtpRequiresAuthLabel") + "</label></div>" +
            /*SMTP Reuse Creds*/
                    "<div class='pas-checkbox " + (!smtpSettings.serverRequiresLogin || !passwordAuth ? "hidden" : "") + "'><label><input id='pasSmtpReuseCreds' type='checkbox' aria-label='" + Jx.escapeHtml(getString("pasSmtpReuseCredsLabel")) + "'" + (smtpSettings.usesMailCredentials ? "checked" : "") + ">" + getString("pasSmtpReuseCredsLabel") + "</label></div>" +
                "</div>" +
            /*SMTP Username and Password*/
                    "<div id='pasSmtpUsernameAndPassword'" + (showSmtpCredControls ? "" : "class='hidden pas-settingGroup'") + ">" +
                        "<label id='pasSmtpUsernameLabel' class='pas-tooltipCheck'>" + getString("pasUsernameLabel") + "</label>" +
                        "<input id='pasSmtpUsername' aria-labelledby='pasSmtpUsernameLabel' type='text' value='" + Jx.escapeHtml(smtpSettings.userId) + "' maxlength='256'>" +
                        "<label id='pasSmtpPasswordLabel' class='pas-tooltipCheck'>" + getString("pasPasswordLabel") + "</label>" +
                        "<input id='pasSmtpPassword' aria-labelledby='pasSmtpPasswordLabel' type='password' value='" + (smtpSettings.hasPasswordCookie ? "********" : "") + "' maxlength='256'>" +
                    "</div>" +
    /*Certificate Settings*/
                Jx.getUI(this._certificateSettingsControl).html +
        /* Special Folders */
                Jx.getUI(this._specialFoldersControl).html +
        /*Removal UI*/
                "<div id='removalUI' data-easOrImapOnly='true'>" +
                    "<div id='pasRemovalNeededStatus' role='status' class='hidden pas-inlineAdvise pas-tooltipCheck'>" + getString("pasRemovalNeeded_" + A.AccountControlBase.mapAppScenarioToAppName[this._scenario]) + "</div>" +
                    "<div class='hidden pas-inlineInfo pas-tooltipCheck' id='pasRemovalMessage' role='alert' aria-live='polite'></div>" +
                    "<input id='pasRemoveBtn' class='singleLineText' type='button' value='" + Jx.escapeHtml(getString("pasRemoveAccountButton")) + "'>" +
                    "<input id='pasRoamedRemoveBtn' class='hidden singleLineText' type='button' value='" + Jx.escapeHtml(getString("pasCloudButton")) + "'>" +
                    "<input id='pasLocalRemoveBtn' class='hidden singleLineText' type='button' value='" + Jx.escapeHtml(getString("pasPCButton")) + "'>" +
                "</div>" +
        /*Manage-account link*/
                "<div data-webOnly='true'><a id='pasManageAccountLink' tabIndex='0'>" + getString("pasManageAccountLink") + "</a></div>" +
            "</div>";
    };

    PerAccountSettingsPage.prototype.activateUI = function () {
        /// <summary>Called after the UI is initialized. getUI has been called at this point.</summary>
        Jx.Component.prototype.activateUI.call(this);

        var container = this._container = document.getElementById(this._id);

        // This must be invoked before WinJS.UI.processAll()
        WinJS.strictProcessing();

        // This sets up the toggle switches
        WinJS.UI.processAll(container);

        var account = this._account;
        var inputs = this._inputs = {
            accountName: container.querySelector("#pasAccountName"),
            userDisplayName: container.querySelector("#pasUserDisplayName"),
            password: container.querySelector("#pasPassword"),
            domain: container.querySelector("#pasDomain"),
            username: container.querySelector("#pasUsername"),
            server: container.querySelector("#pasServer"),
            smtpServer: container.querySelector("#pasSmtpServer"),
            port: container.querySelector("#pasImapPort"),
            smtpPort: container.querySelector("#pasSmtpPort"),
            smtpPassword: container.querySelector("#pasSmtpPassword"),
            smtpUsername: container.querySelector("#pasSmtpUsername"),
            signature: container.querySelector("#pasSignature"),
            autoreply: container.querySelector("#pasAutoreplyMessage"),
            autoreplyExternal: container.querySelector("#pasAutoreplyMessageExternal")
        };
        this._dropDowns = {
            preferredEmail: container.querySelector("#pasPreferredEmail"),
            syncInterval: container.querySelector("#pasSyncInterval"),
            syncWindow: container.querySelector("#pasSyncWindow"),
            toast: container.querySelector("#pasEnableToast")
        };
        var checkBoxes = this._checkBoxes = {
            syncMail: container.querySelector("#pasContentTypeEmail"),
            syncContacts: container.querySelector("#pasContentTypeContacts"),
            syncCalendar: container.querySelector("#pasContentTypeCalendar"),
            enableNewsletterView: container.querySelector("#pasNewsletterView"),
            enableSocialUpdatesView: container.querySelector("#pasSocialUpdatesView"),
            ssl: container.querySelector("#pasUseSsl"),
            smtpSsl: container.querySelector("#pasSmtpUseSsl"),
            smtpRequiresAuth: container.querySelector("#pasSmtpRequiresAuth"),
            smtpReuseCreds: container.querySelector("#pasSmtpReuseCreds"),
            autoreplyForKnownCheck: container.querySelector("#pasAutoreplyForKnownCheck")
        };
        var toggles = this._toggles = {
            externalImages: container.querySelector("#pasEnableExternalImages").winControl,
            signature: container.querySelector("#pasEnableSignature").winControl,
            autoreply: container.querySelector("#pasEnableAutoreply").winControl
        };
        var buttons = this._buttons = {
            remove: container.querySelector("#pasRemoveBtn"),
            roamedRemove: container.querySelector("#pasRoamedRemoveBtn"),
            localRemove: container.querySelector("#pasLocalRemoveBtn")
        };
        var links = this._links = {
            manageAccount: container.querySelector("#pasManageAccountLink")
        };
        this._groups = {
            autoreplyDetails: container.querySelector("#pasAutoreplyDetails")
        };

        // Do a basic pass to show/hide controls that pertain to the
        // current account type.
        this._showHideControls();

        if (this._account.getConfigureType(this._scenario) === Plat.ConfigureType.editOnClient) {
            // Ensure dropdown states are correct
            this._updateSyncIntervalSetting();
            this._updatePreferredEmailSetting();

            // Ensure sync-content states are correct
            this._updateContentToSyncGroup();

            // Ensure category views are correct
            this._updateCategoryViewsGroup();

            // Ensure all the mail-specific controls have the correct state.
            this._updateMailSpecificControls();

            // Show any error status
            var error = this._getCurrentError(account);
            if (error === A.KnownAccountError.badCredentials) {
                Jx.removeClass(container.querySelector("#pasCredentialStatus"), "hidden");
            } else if (error === A.KnownAccountError.noCredentials) {
                var status = container.querySelector("#pasCredentialStatus");
                status.innerText = getString("actdlgDescription-EasiID");
                Jx.removeClass(status, "hidden");
            } else if (error === A.KnownAccountError.syncFailed) {
                Jx.removeClass(container.querySelector("#pasAccountStatus"), "hidden");
            } else if (error === A.KnownAccountError.removalNeeded) {
                Jx.removeClass(container.querySelector("#pasRemovalNeededStatus"), "hidden");
            }
        }

        this._onRemove = this._confirmRemove;

        // Setup event listeners
        buttons.remove.addEventListener("click", function () { this._onRemove(); } .bind(this), true);
        buttons.roamedRemove.addEventListener("click", this._onAccountRemove.bind(this, Plat.Account.prototype.deleteObject), false);
        buttons.localRemove.addEventListener("click", this._onAccountRemove.bind(this, Plat.Account.prototype.deleteFromLocalDevice), false);

        links.manageAccount.addEventListener("click", this._onManage.bind(this), false);
        links.manageAccount.addEventListener("keydown", function (ev) { if (ev.key === "Spacebar" || ev.key === "Enter") { this._onManage(); } } .bind(this), false);
        checkBoxes.smtpRequiresAuth.addEventListener("change", function () {
            Jx.setClass(checkBoxes.smtpReuseCreds.parentElement, "hidden", !checkBoxes.smtpRequiresAuth.checked);
        });
        checkBoxes.smtpReuseCreds.addEventListener("change", function () {
            Jx.setClass(document.querySelector("#pasSmtpUsernameAndPassword"), "hidden", checkBoxes.smtpReuseCreds.checked);
        });
        var mailResource = account.getResourceByType(Plat.ResourceType.mail);
        checkBoxes.syncMail.addEventListener("change", function () {
            _disableControlsWhere(container, "[data-requiresMail='true']", !checkBoxes.syncMail.checked);
            // _updateToastSetting is needed to ensure we don't incorrectly enable the toast dropdown, which relies on other system settings in addition to the mail resource to be enabled.
            this._updateToastSetting(mailResource);

            // Ensure that we don't incorrectly enable the signature input when the signature toggle is off.
            if (!toggles.signature.checked) {
                inputs.signature.disabled = "disabled";
            }
            
        } .bind(this));
        inputs.password.addEventListener("change", function () { this._passwordDirty = true; } .bind(this));
        inputs.smtpPassword.addEventListener("change", function () { this._smtpPasswordDirty = true; } .bind(this));
        inputs.signature.addEventListener("change", function () { this._signatureDirty = true; }.bind(this));

        // Keep our header title up-to-date with the display name of the account
        inputs.accountName.addEventListener("change", function () {
            inputs.accountName.value = inputs.accountName.value || account.serviceName;
            this.getParent().updateHeaderText();
        } .bind(this), false);

        if (account.isDefault) {
            var auth = new O.OnlineIdAuthenticator();
            if (auth.canSignOut) {
                // Alter text of the remove button if this is a Local Id.
                buttons.remove.value = getString("pasRemoveAllAccountsButton");
                container.querySelector("#pasRemovalMessage").innerText = getString("pasRemoveLocalIdConfirm");
            } else {
                // Disable 'remove' button if this is the default account and is a Connected Id
                buttons.remove.disabled = "disabled";
                var removeMsg = container.querySelector("#pasRemovalMessage");
                removeMsg.innerText = getString("pasRemovalInstructions");
                Jx.removeClass(removeMsg, "hidden");
            }
        } else if (!account.canDelete) {
            buttons.remove.disabled = "disabled";
        } else if (Plat.HintState.primaryAccount === account.hintState) {
            buttons.remove.value = getString("pasRemoveAllAccountsButton");
            container.querySelector("#pasRemovalMessage").innerText = getString("pasRemoveLocalIdConfirm");
        } else {
            container.querySelector("#pasRemovalMessage").innerText = getString("pasRemoveSecondaryAccountConfirm");
        }

        msSetImmediate(function () {
            if (this.hasUI()) {
                if (error !== A.KnownAccountError.removalNeeded) {

                    // Scroll into view the first error message that's being shown, if any.
                    var errors = Array.prototype.filter.call(container.querySelectorAll(".pas-inlineAdvise"), function (el) {
                        return (el.offsetWidth !== 0 && el.offsetHeight !== 0);
                    });

                    if (errors && errors[0]) {
                        var errorElement = errors[0];
                        errorElement.scrollIntoView();
                        var value = errorElement.getAttribute("data-associatedControl");
                        if (Jx.isNonEmptyString(value)) {
                            this._activeElement = container.querySelector("#" + value);
                        }
                    } else {
                        this._activeElement = inputs.accountName;
                    }

                    if (!this._delayFocusSetting) {
                        this._setActiveElement();
                    }
                } else {
                    // Scroll down to the remove-button so the user can see the error message.
                    buttons.remove.scrollIntoView();
                }
            }
        }.bind(this));

        this._jobset.addUIJob(this, this._tooltipCheck, null, P.Priority.accessibility);
    };

    PerAccountSettingsPage.prototype.flyoutReady = function () {
        if (this._delayFocusSetting) {
            this._setActiveElement();
        }
    };

    PerAccountSettingsPage.prototype._setActiveElement = function () {
        if (this._activeElement) {
            Jx.safeSetActive(this._activeElement);
        }
    };

    PerAccountSettingsPage.prototype.shutdownUI = function () {
        /// <summary>Called when our control being hidden</summary>
        // If the account was deleted, it will already be null.
        if (Jx.isObject(this._account)) {
            this._applySettings();
        }
        Jx.dispose(this._jobset);

        this._account = null;

        if (this._pointerDownListener) {
            document.removeEventListener("MSPointerDown", this._pointerDownListener, true);
            this._pointerDownListener = null;
        }

        Jx.Component.prototype.shutdownUI.call(this);
    };

    PerAccountSettingsPage.prototype._tooltipCheck = function () {
        var elements = this._container.querySelectorAll(".pas-tooltipCheck");
        Array.prototype.forEach.call(elements, function (element) {
            /// <param name="element" type="HTMLElement"/>
            element.style.overflow = "visible";
            element.title = ((element.scrollWidth > element.clientWidth) ? element.innerText : "");
            element.style.overflow = "";
        }, this);
    };


    PerAccountSettingsPage.prototype._showHideControls = function () {
        /// <summary>Helper functions to show/hide settings controls based on the current type of account</summary>
        var eConfigureType = this._account.getConfigureType(this._scenario);
        var container = this._container;
        var queries = [];

        switch (eConfigureType) {
            case Plat.ConfigureType.editOnClient:
                {
                    var isImap = this._account.accountType === Plat.AccountType.imap;

                    // Hide any webconfigurable-account-specific settings
                    queries.push("[data-webOnly=true]");

                    var easSettings = this._account.getServerByType(Plat.ServerType.eas);
                    if (!easSettings || (easSettings && !easSettings.isOofSupported()) || (this._scenario !== Plat.ApplicationScenario.mail) || (Plat.ScenarioState.unknown === this._account.mailScenarioState)) {
                        // Hide oof setting if not supported
                        queries.push("[data-easOofSupportedOnly=true]");
                    }
                    
                    var settings = easSettings || this._account.getServerByType(Plat.ServerType.imap);
                    if (settings && !settings.supportsAdvancedProperties) {
                        // Hide any settings any advanced settings for eas or imap
                        queries.push("[data-easAdvancedOnly=true]", "[data-imapAdvancedOnly=true]", "[data-easOrImapAdvancedOnly=true]");
                    } else {
                        // Hide any settings that are advanced settings not for this type of account.
                        if (isImap) { queries.push("[data-easAdvancedOnly=true]"); } else { queries.push("[data-imapAdvancedOnly=true]"); }
                    }

                    if (isImap) { queries.push("[data-easOnly=true]"); } else { queries.push("[data-imapOnly=true]"); }

                    _hideControlsWhere(container, queries.join(","));
                }
                break;
            case Plat.ConfigureType.editOnWeb:
                // Hide all eas-specific settings
                queries.push("[data-imapOnly=true]", "[data-easOnly=true]", "[data-easAdvancedOnly=true]", "[data-imapAdvancedOnly=true]", "[data-easOrImapAdvancedOnly=true]", "[data-easOrImapOnly=true]", "[data-easOofSupportedOnly=true]");

                // Need to hide the "Manage on web" link when in demo mode
                if (Jx.appData.localSettings().get("RetailExperience")) {
                    queries.push("[data-webOnly=true]");
                }

                _hideControlsWhere(container, queries.join(","));

                // Not all web-configurable accounts will have an email address.
                if (!Jx.isNonEmptyString(this._account.emailAddress)) {
                    Jx.addClass(this._dropDowns.preferredEmail, "hidden");
                    Jx.addClass(container.querySelector("#pasPreferredEmailLabel"), "hidden");
                }
                break;
            default:
                Debug.assert(false, "Unrecognized configureType: " + eConfigureType);
                break;
        }
    };

    PerAccountSettingsPage.prototype._updateMailSpecificControls = function () {
        /// <summary>Updates the state of the controls which rely on the mail resource</summary>
        var mailResource = this._account.getResourceByType(Plat.ResourceType.mail);
        if (!mailResource || (this._scenario !== Plat.ApplicationScenario.mail) || (Plat.ScenarioState.unknown === this._account.mailScenarioState)) {
            this._mailControlsHidden = true;
            _hideControlsWhere(this._container, "[data-requiresMail=true]");
        } else {
            // Remeber that we showed the mail controls
            this._mailControlsHidden = false;

            // Set the correct download-external-images value
            this._toggles.externalImages.checked = mailResource.allowExternalImages;

            // Set the correct selected option for the current sync-windows-size value.
            this._dropDowns.syncWindow.value = mailResource.syncWindowSize.toString();

            // Update the signature settings
            this._updateSignatureSetting(mailResource);

            // Update the toast setting
            this._updateToastSetting(mailResource);

            // This needs to run after _updateSignatureSettings() so that the signature input isn't enabled on activation when Mail is disabled. 
            // (The _updateSignatureSettings looks strictly at the signature settings on the account, and doesn't consider the state of the mail resource.)
            if (!mailResource.isEnabled) {
                _disableControlsWhere(this._container, "[data-requiresMail=true]", true /*disable*/);
            }
            
            // Update the autoreply setting
            this._updateAutoreplySettings();
        }
    };

    function _getToastState(account, mailResource) {
        ///<summary>Retrieves the toast-enabled state for the given account.  Handles the non-availability of favorites toast view for IMAP accounts</summary>
        var toastState = mailResource.toastState;
        return toastState;
    }

    PerAccountSettingsPage.prototype._updateToastSetting = function (mailResource) {
        /// <summary>Set the toast-enabled state to match its corresponding account property value</summary>
        /// <param name="mailResource" type="Plat.AccountResource"/>
        Debug.assert(mailResource);
        var dropDowns = this._dropDowns;

        // Check to make sure we can turn-on notifications
        if (!this._isPackageOnLockScreen()) {
            dropDowns.toast.disabled = true;
            Jx.removeClass(this._container.querySelector("#pasEnableToastInstructions"), "hidden");
        } else {
            try {
                // Verify that toast notification are enabled system-wide
                var notificationManager = N.ToastNotificationManager;
                var toastNotifier = notificationManager.createToastNotifier();
                if (toastNotifier.setting !== N.NotificationSetting.enabled) {
                    dropDowns.toast.disabled = true;
                    // Check if the user has the ability to enable toasts
                    if (toastNotifier.setting === N.NotificationSetting.disabledForUser ||
                        toastNotifier.setting === N.NotificationSetting.disabledForApplication) {
                        // If so, tell them how to turn them on.
                        Jx.removeClass(this._container.querySelector("#pasEnableToastInstructions"), "hidden");
                    }
                }
            } catch (ex) {
                dropDowns.toast.disabled = true;
                Jx.log.exception("PerAccountSettingsPage._updateToastSetting failed", ex);
            }
        }

        if (dropDowns.toast.disabled)
        {
            dropDowns.toast.value = Plat.ToastState.none;
        }
        else
        {
            dropDowns.toast.value = _getToastState(this._account, mailResource);
        }
    };

    PerAccountSettingsPage.prototype._updateSyncIntervalSetting = function () {
        /// <summary>Set the sync-interval state to match its corresponding account property value</summary>
        var account = this._account;
        var dropDowns = this._dropDowns;

        var info = this._container.querySelector("#pasSyncIntevalStatus");

        // Set the correct selected option and available options for sync-interval.
        if (this._isPackageOnLockScreen()) {
            // We're on the lockscreen, so all the options are possibly valid. We
            // need to make sure push is available for any accounts that aren't currently
            // set to push.
            var syncType = account.syncType;
            var pollInterval = account.pollInterval;

            if (syncType === Plat.SyncType.push || this._platform.accountManager.canSetSyncTypePush()) {
                _addOption(dropDowns.syncInterval, getString("pasSyncIntervalPush"), SyncInterval.push, true);
            }
            _addOption(dropDowns.syncInterval, getString("pasSyncIntervalPoll15"), SyncInterval.poll15, (syncType === Plat.SyncType.poll && pollInterval === 15));
            _addOption(dropDowns.syncInterval, getString("pasSyncIntervalPoll30"), SyncInterval.poll30, (syncType === Plat.SyncType.poll && pollInterval === 30));
            _addOption(dropDowns.syncInterval, getString("pasSyncIntervalPoll60"), SyncInterval.poll60, (syncType === Plat.SyncType.poll && pollInterval === 60));
            _addOption(dropDowns.syncInterval, getString("pasSyncIntervalManual"), SyncInterval.manual, syncType === Plat.SyncType.manual);

            //Check if we have a push error
            if (this._getCurrentError(account) === A.KnownAccountError.pushFailed) {
                info.innerText = getString("pasPushError");
                Jx.removeClass(info, "hidden");
            }

        } else {
            // The only valid option for non-locking apps is manual synchronization. Remove
            // all the other options
            _addOption(dropDowns.syncInterval, getString("pasSyncIntervalManual"), SyncInterval.manual, true);

            // Show our message instructing the user how to get on the lockscreen. Good luck, user.
            info.innerText = getString("pasAddToLockScreenInfo");
            Jx.removeClass(info, "hidden");
        }
    };

    PerAccountSettingsPage.prototype._updatePreferredEmailSetting = function () {
        /// <summary>Set the preferred email state to match its corresponding account property value</summary>
        var account = this._account,
            preferredEmailDropDown = this._dropDowns.preferredEmail,
            sendAsAddresses = account.sendAsAddresses,
            sendAsCount = sendAsAddresses.size,
            preferred = account.preferredSendAsAddress;

        for (var i = 0; i < sendAsCount; i++) {
            var email = sendAsAddresses[i];

            _addOption(preferredEmailDropDown, email, email, email === preferred);
        }

        // The drop down should be disabled if the account doesn't have multiple addresses to choose from
        preferredEmailDropDown.disabled = (sendAsCount < 2);
    };

    PerAccountSettingsPage.prototype._updateContentToSyncGroup = function () {
        /// <summary>Set the sync-content states and visiblity to match their corresponding account property values</summary>
        var account = this._account;
        var checkboxes = this._checkBoxes;
        var mail = account.getResourceByType(Plat.ResourceType.mail);
        var calendar = account.getResourceByType(Plat.ResourceType.calendar);
        var contacts = account.getResourceByType(Plat.ResourceType.contacts);
        var disabledCount = 0;
        var isPrimary = (Plat.HintState.primaryAccount === account.hintState);
        var isDefaultOrPrimary = account.isDefault || isPrimary;

        if (mail && mail.canEdit) { checkboxes.syncMail.checked = mail.isEnabled; } else { checkboxes.syncMail.parentElement.style.display = "none"; disabledCount++; }
        if (calendar && calendar.canEdit) { checkboxes.syncCalendar.checked = calendar.isEnabled; } else { checkboxes.syncCalendar.parentElement.style.display = "none"; disabledCount++; }
        if (contacts && contacts.canEdit) { checkboxes.syncContacts.checked = contacts.isEnabled; } else { checkboxes.syncContacts.parentElement.style.display = "none"; disabledCount++; }

        if (isPrimary || (Plat.ScenarioState.unknown === account.mailScenarioState)) {
            // Can't turn off mail for the primary account.
            checkboxes.syncMail.parentElement.style.display = "none";
            disabledCount++;
        }
        if (isDefaultOrPrimary) {
            // Can't turn off calendar or contacts for the default account.
            checkboxes.syncCalendar.parentElement.style.display = "none";
            checkboxes.syncContacts.parentElement.style.display = "none";
            disabledCount += 2;
        }

        // If there are no available checkboxes, hide the entire group.
        if (disabledCount === 3) {
            this._container.querySelector("#pasContentToSync").style.display = "none";
        }
    };

    function bindViewToCheckbox(platform, account, viewType, checkbox) {
        /// <summary>Sets up the given checkbox with the current enabled state of a view, and updates the view when checked or unchecked</summary>
        var view = platform.mailManager.ensureMailView(viewType, account.objectId, "");
        if (view) {
            checkbox.checked = view.isEnabled;
            checkbox.addEventListener("change", function () {
                view.setEnabled(checkbox.checked);
            });
        } else {
            checkbox.parentElement.style.display = "none";
        }
        return Boolean(view);
    }

    PerAccountSettingsPage.prototype._updateCategoryViewsGroup = function () {
        var account = this._account,
            platform = this._platform,
            checkBoxes = this._checkBoxes;

        var newsletterAvailable = bindViewToCheckbox(platform, account, Plat.MailViewType.newsletter, checkBoxes.enableNewsletterView),
            socialUpdatesAvailable = bindViewToCheckbox(platform, account, Plat.MailViewType.social, checkBoxes.enableSocialUpdatesView);

        if (!newsletterAvailable && !socialUpdatesAvailable) {
            this._container.querySelector("#pasOrganizeYourMail").style.display = "none";
        }
    };

    function isNowBetween(startTime, endTime) {
        var now = new Date();
        return ((!startTime || now > startTime) && (!endTime || now < endTime));
    }

    PerAccountSettingsPage.prototype._updateAutoreplySettings = function () {
        /// <summary>Set the autoreply setting to match its corresponding property values</summary>
        var toggles = this._toggles,
            inputs = this._inputs,
            groups = this._groups,
            checkBoxes = this._checkBoxes;

        var easSettings = this._account.getServerByType(Plat.ServerType.eas);

        if (Jx.isObject(easSettings) && easSettings.isOofSupported()) {
            var oofState = easSettings.oofState && isNowBetween(easSettings.oofStartTime, easSettings.oofEndTime);
            toggles.autoreply.checked = oofState;
            groups.autoreplyDetails.style.display = oofState ? "" : "none";

            // Listen for changes to the autoreply-on toggle, to show/hide the autoreply message box etc.
            toggles.autoreply.addEventListener("change", function () {
                groups.autoreplyDetails.style.display = (toggles.autoreply.checked ? "" : "none");
            });
            
            if (Jx.isNonEmptyString(easSettings.oofBodyForInternal)) {
                inputs.autoreply.value = easSettings.oofBodyForInternal;
            } 
            
            var isHotmail = easSettings.isWlasSupported;
            if (isHotmail) {
                // Hotmail account
                checkBoxes.autoreplyForKnownCheck.checked = !easSettings.oofEnabledForUnknownExternal;
                inputs.autoreplyExternal.style.display = "none";
            } else {
                // Exchange account
                var oofEnabledForExternal = easSettings.oofEnabledForKnownExternal;
                checkBoxes.autoreplyForKnownCheck.checked = oofEnabledForExternal;
                inputs.autoreplyExternal.style.display = oofEnabledForExternal ? "" : "none";

                // Listen for changes to the oofEnabled for external checkbox to show/hide the autoreply message box for external oof message.
                checkBoxes.autoreplyForKnownCheck.addEventListener("change", function () {
                    inputs.autoreplyExternal.style.display = (checkBoxes.autoreplyForKnownCheck.checked ? "" : "none");
                });

                if (Jx.isNonEmptyString(easSettings.oofBodyForKnownExternal)) {
                    inputs.autoreplyExternal.value = easSettings.oofBodyForKnownExternal;
                }
            }
            
        } else {
            // Hide the setting if oof isn't supported for this account.
            this._container.querySelector("[data-easOofSupportedOnly=true]").style.display = "none";
        }
    };

    PerAccountSettingsPage.prototype._applyAutoreplySettings = function () {
        /// <summary>Applies any updates on auto reply settings to the EAS settings object</summary>
        /// <returns type="Boolean">Returns if there's any update</returns>
        var toggles = this._toggles,
            inputs = this._inputs,
            checkBoxes = this._checkBoxes;
            
        var dirty = false;
        
        var easSettings = this._account.getServerByType(Plat.ServerType.eas);
        if (easSettings && easSettings.isOofSupported()) {
            var isHotmail = easSettings.isWlasSupported;

            // Ensure that if the oof message is empty, the toggle/checkbox is off.
            if (!Jx.isNonEmptyString(inputs.autoreply.value)) {
                toggles.autoreply.checked = false;
            }
            if (!Jx.isNonEmptyString(inputs.autoreplyExternal.value) && !isHotmail) {
                checkBoxes.autoreplyForKnownCheck.checked = false;
            }
            
            // Save settings. Note that we save message body regardless of whether the oof setting is on or off. This is the desired behavior.
            if (isHotmail) {
                // This is Hotmail account
                if (easSettings.oofState !== toggles.autoreply.checked) {
                    easSettings.oofState = easSettings.oofEnabledForInternal = easSettings.oofEnabledForKnownExternal = toggles.autoreply.checked;
                    dirty = true;
                }
                // Always save the updated message body
                if (easSettings.oofBodyForInternal.replace(/\r/g, "") !== inputs.autoreply.value) {
                    easSettings.oofBodyForInternal = easSettings.oofBodyForKnownExternal = inputs.autoreply.value;
                    dirty = true;
                }
                if (easSettings.oofEnabledForUnknownExternal === checkBoxes.autoreplyForKnownCheck.checked) {
                    easSettings.oofEnabledForUnknownExternal = !checkBoxes.autoreplyForKnownCheck.checked;
                    dirty = true;
                }
                // There's no UI for oofBodyForUnknownExternal. We are only updating the value based on other settings. 
                if (dirty) {
                    easSettings.oofBodyForUnknownExternal = checkBoxes.autoreplyForKnownCheck.checked ? null : easSettings.oofBodyForKnownExternal;
                }
            } else {
                // This is exchange account
                var oofState = easSettings.oofState && isNowBetween(easSettings.oofStartTime, easSettings.oofEndTime);
                if (oofState !== toggles.autoreply.checked) {
                    easSettings.oofState = easSettings.oofEnabledForInternal = toggles.autoreply.checked;
                    dirty = true;
                }
                // Always save the updated message body
                if (easSettings.oofBodyForInternal.replace(/\r/g, "") !== inputs.autoreply.value) {
                    easSettings.oofBodyForInternal = inputs.autoreply.value;
                    dirty = true;
                }
                if (easSettings.oofEnabledForKnownExternal !== checkBoxes.autoreplyForKnownCheck.checked) {
                    easSettings.oofEnabledForKnownExternal = easSettings.oofEnabledForUnknownExternal = checkBoxes.autoreplyForKnownCheck.checked;
                    dirty = true;
                }
                // Always save the updated message body
                if (easSettings.oofBodyForKnownExternal.replace(/\r/g, "") !== inputs.autoreplyExternal.value) {
                    easSettings.oofBodyForKnownExternal = easSettings.oofBodyForUnknownExternal = inputs.autoreplyExternal.value;
                    dirty = true;
                }
            }
            
            if (dirty) {
                // Make sure to clear out the start time and end time if there's any change for the oof setting
                easSettings.oofStartTime = easSettings.oofEndTime = null;
            }     
        }
        return dirty;
    };

    PerAccountSettingsPage.prototype._updateSignatureSetting = function (mailResource) {
        /// <summary>Set the singature settings states and visiblity to match their corresponding account property values</summary>
        /// <param name="mailResource" type="Plat.AccountResource"/>
        Debug.assert(mailResource);

        var toggles = this._toggles;
        var inputs = this._inputs;

        inputs.signature.value = mailResource.signatureText;

        if (mailResource.signatureType !== Plat.SignatureType.disabled) {
            toggles.signature.checked = true;
            inputs.signature.disabled = "";
        } else {
            toggles.signature.checked = false;
        }
        // Listen for changes to the signature-on toggle, to enable/disable the signature text box.
        toggles.signature.addEventListener("change", function () {
            inputs.signature.disabled = (toggles.signature.checked ? "" : "disable");
        });

        // If the user clears the signature text, disable the control.
        var checkForAnEmptySignature = function () {
            if (toggles.signature.checked && !Jx.isNonEmptyString(inputs.signature.value)) {
                toggles.signature.checked = false;
            }
        };
        inputs.signature.addEventListener("input", checkForAnEmptySignature);

        checkForAnEmptySignature();
    };

    PerAccountSettingsPage.prototype._applySettings = function () {
        /// <summary>Applies any updates settings to the account object and commits this</summary>
        var dirty = false;
        var account = this._account;
        var eConfigureType = this._account.getConfigureType(this._scenario);

        if (eConfigureType === Plat.ConfigureType.editOnClient) {
            var inputs = this._inputs;
            var checkBoxes = this._checkBoxes;
            var dropDowns = this._dropDowns;
            var toggles = this._toggles;

            // The "change" event we have on the some of the input fields do not fire until they lose focus.
            // To ensure it does fire, and the its dirty-flag properly set, force them to lose focus.
            var activeElement = document.activeElement;
            for (var inputName in inputs) {
                if (inputs[inputName] === activeElement) {
                    inputs[inputName].blur();
                }
            }

            var settings = account.getServerByType(Plat.ServerType.eas) || account.getServerByType(Plat.ServerType.imap);
            var smtpSettings = account.getServerByType(Plat.ServerType.smtp);

            this._specialFoldersControl.applyChanges();
            dirty = this._certificateSettingsControl.applyChanges();

            // Only apply values from our controls if somethings changed. And mark the 'dirty' flag if we have any changes.
            var currentDisplayName = account.displayName;
            if (currentDisplayName !== inputs.accountName.value.trim()) { dirty = true; account.displayName = inputs.accountName.value; }
            if (account.userDisplayName !== inputs.userDisplayName.value.trim()) { dirty = true; account.userDisplayName = inputs.userDisplayName.value; }
            if (settings.domain !== inputs.domain.value) { dirty = true; settings.domain = inputs.domain.value.trim(); }
            if (settings.userId !== inputs.username.value) { dirty = true; settings.userId = inputs.username.value.trim(); }
            if (settings.server !== inputs.server.value) { dirty = true; settings.server = inputs.server.value.trim(); }
            if (settings.port !== parseInt(inputs.port.value, 10) && _looksLikeAPort(inputs.port.value)) { dirty = true; settings.port = parseInt(inputs.port.value, 10); }
            if (settings.useSsl !== checkBoxes.ssl.checked) { dirty = true; settings.useSsl = checkBoxes.ssl.checked; }

            if (smtpSettings) {
                if (checkBoxes.smtpReuseCreds.checked) {
                    if (!smtpSettings.usesMailCredentials) { dirty = true; smtpSettings.usesMailCredentials = true; }
                } else if (smtpSettings.userId !== inputs.smtpUsername.value) {
                    dirty = true; smtpSettings.userId = inputs.smtpUsername.value.trim();
                }
                if (smtpSettings.server !== inputs.smtpServer.value) { dirty = true; smtpSettings.server = inputs.smtpServer.value.trim(); }
                if (smtpSettings.port !== parseInt(inputs.smtpPort.value, 10) && _looksLikeAPort(inputs.port.value)) { dirty = true; smtpSettings.port = parseInt(inputs.smtpPort.value, 10); }
                if (smtpSettings.useSsl !== checkBoxes.smtpSsl.checked) { dirty = true; smtpSettings.useSsl = checkBoxes.smtpSsl.checked; }
                if (smtpSettings.serverRequiresLogin !== checkBoxes.smtpRequiresAuth.checked) { dirty = true; smtpSettings.serverRequiresLogin = checkBoxes.smtpRequiresAuth.checked; }
            }

            var mail = account.getResourceByType(Plat.ResourceType.mail);
            var calendar = account.getResourceByType(Plat.ResourceType.calendar);
            var contacts = account.getResourceByType(Plat.ResourceType.contacts);

            if (mail && mail.canEdit) {
                if (mail.isEnabled !== checkBoxes.syncMail.checked) { dirty = true; mail.isEnabled = checkBoxes.syncMail.checked; }

                if (!this._mailControlsHidden) {
                    // Apply the sync-window-size value
                    var syncWindowSize = parseInt(dropDowns.syncWindow.value, 10);
                    if (mail.syncWindowSize !== syncWindowSize) { dirty = true; mail.syncWindowSize = syncWindowSize; }

                    // Apply enable-toast value
                    if (!dropDowns.toast.disabled) {
                        var toastState = parseInt(dropDowns.toast.value, 10);
                        if (_getToastState(account, mail) !== toastState) { dirty = true; mail.toastState = toastState; }
                    }

                    // Apply enable external images value
                    var externalImagesState = toggles.externalImages.checked;
                    if (mail.allowExternalImages !== externalImagesState) { dirty = true; mail.allowExternalImages = externalImagesState; }

                    // Save changes to the signature text, regardless of the final state of the signature (i.e. enabled or disabled)
                    if (this._signatureDirty && inputs.signature.value !== mail.signatureText) {
                        dirty = true;
                        mail.signatureText = inputs.signature.value;
                    }

                    // Ensure that if the signature text is empty, the toggle is off.
                    if (!Jx.isNonEmptyString(inputs.signature.value)) {
                        toggles.signature.checked = false;
                    }

                    // Save the state of the signature
                    if (!toggles.signature.checked && ((mail.signatureType !== Plat.SignatureType.disabled) || this._signatureDirty)) {
                        // User turned off signature
                        dirty = true;
                        mail.signatureType = Plat.SignatureType.disabled;
                    } else if (toggles.signature.checked && ((mail.signatureType !== Plat.SignatureType.enabled) || this._signatureDirty)) {
                        dirty = true;
                        mail.signatureType = Plat.SignatureType.enabled;
                    }
                    
                    if (this._applyAutoreplySettings()) {
                        dirty = true;
                    }                    
                }
            }
            if (calendar && calendar.canEdit) {
                if (calendar.isEnabled !== checkBoxes.syncCalendar.checked) { dirty = true; calendar.isEnabled = checkBoxes.syncCalendar.checked; }
            }
            if (contacts && contacts.canEdit) {
                if (contacts.isEnabled !== checkBoxes.syncContacts.checked) { dirty = true; contacts.isEnabled = checkBoxes.syncContacts.checked; }
            }

            // Apply the sync-interval value. Ignoring any "changes" if there's only one option, 'manual',
            // as the user did not really select this.
            if (dropDowns.syncInterval.options.length !== 1) {
                var syncInterval = parseInt(dropDowns.syncInterval.value, 10);
                switch (syncInterval) {
                    case SyncInterval.push:
                        if (account.syncType !== Plat.SyncType.push) { dirty = true; account.syncType = Plat.SyncType.push; }
                        break;
                    case SyncInterval.manual:
                        if (account.syncType !== Plat.SyncType.manual) { dirty = true; account.syncType = Plat.SyncType.manual; }
                        break;
                    case SyncInterval.poll15:
                    case SyncInterval.poll30:
                    case SyncInterval.poll60:
                        if (account.syncType !== Plat.SyncType.poll || account.pollInterval !== syncInterval) { dirty = true; account.syncType = Plat.SyncType.poll; account.pollInterval = syncInterval; }
                        break;
                    default:
                        Debug.assert(false, "Unknown sync-interval type, " + syncInterval);
                        break;
                }
            }

            if (account.preferredSendAsAddress !== dropDowns.preferredEmail.value) {
                dirty = true;
                account.preferredSendAsAddress = dropDowns.preferredEmail.value;
            }

            var password = (this._passwordDirty ? inputs.password.value : "");
            var smtpPassword = (!checkBoxes.smtpReuseCreds.checked && this._smtpPasswordDirty ? inputs.smtpPassword.value : "");

            var commitChanges = /*@bind(PerAccountSettingsPage)*/function() {
                if (dirty) {
                    var mail = account.getResourceByType(Plat.ResourceType.mail);
                    if (mail) {
                        // Mark the default account as needing a sync.
                        mail.isSyncNeeded = true;
                    }
                    this._safeCommit(account);
                }
            }.bind(this);

            WinJS.Promise.join([_encryptPassword(password), _encryptPassword(smtpPassword)]).then(/*@bind(PerAccountSettingsPage)*/function (encryptedPasswords) {

                // We can't compare passwords; the platform doesn't permit us read it. 
                // So, if the user enters anything in the password field we'll re-set it on the account.
                if (encryptedPasswords[0]) {
                    settings.setPasswordCookie(Crypto.CryptographicBuffer.encodeToBase64String(encryptedPasswords[0]));
                    dirty = true; // This is really a guess. Their password might have changed. We won't know until we try to sync.
                }

                if (smtpSettings && ((encryptedPasswords[1] && !checkBoxes.smtpReuseCreds.checked) || (encryptedPasswords[0] && checkBoxes.smtpReuseCreds.checked))) {
                    var encryptedPassword = checkBoxes.smtpReuseCreds.checked ? encryptedPasswords[0] : encryptedPasswords[1];
                    smtpSettings.setPasswordCookie(Crypto.CryptographicBuffer.encodeToBase64String(encryptedPassword));
                    dirty = true; // This is really a guess. Their password might have changed. We won't know until we try to sync.
                }
            }.bind(this)).then(/*@bind(PerAccountSettingsPage)*/function () {
                // If there's a certificate applied to the account, we may need to ask the user to grant us permission to use it.
                var selectedCert = this._certificateSettingsControl.selectedCertificate;
                if (Jx.isObject(settings.certificateThumbPrint) && Jx.isObject(selectedCert)) {
                    return A.CertificateUtils.invokeCertificatePromptIfNeededAsync(selectedCert);
                } else {
                    return WinJS.Promise.wrap(null);
                }
            }.bind(this)).done(function onComplete(res) {
                if (res === A.CertPromptResult.accessGranted) {
                    dirty = true;
                }
                commitChanges();
            }, commitChanges /*onError*/);

        } else {
            if (dirty) {
                account.isSyncNeeded = true;
                this._safeCommit(account);
            }
        }
    };

    PerAccountSettingsPage.prototype._safeCommit = function (account) {
        /// <summary>A non-throwing verions of commit().</summary>
        try {
            account.commit();
        } catch (e) {
            Jx.log.exception("PerAccountSettingsPage failed on commit().", e);
        }
    };

    PerAccountSettingsPage.prototype._onManage = function () {
        /// <summary>Handler for the manage-account link</summary>
        this._manageAccountOnline(this._account);
    };

    PerAccountSettingsPage.prototype._onAccountRemove = function (deleteFn) {
        /// <summary>Deletes the account using the given delete operation.</summary>
        /// <param name='deleteFn' type='Function'>Either deleteObject() or deleteFromLocalDevice()</summary>
        Debug.assert(Jx.isFunction(deleteFn));
        Debug.assert(this._account.canDelete);
        if (this._account.canDelete) {
            deleteFn.call(this._account);
            this._account = null;
            this.getParent().navigateToPage(A.AccountSettingsPage.connectedAccounts);
        }
    };

    PerAccountSettingsPage.prototype._onPrimarySignout = function () {
        /// <summary>Signs out the user's Primary Account.</summary>
        Debug.assert(this._account.canDelete);
        if (this._account.canDelete) {
            var platform = this._platform;

            // We have to cache the default account before deleting the primary account
            var defaultAccount = platform.accountManager.defaultAccount;
            this._account.deleteObject();

            // Make the platform check the current connected id state
            this._forcePlatformConnectedIdCheckAsync(platform, defaultAccount);

            // Disable the button to prevent another press
            this._buttons.remove.disabled = "disabled";
        }
    };

    PerAccountSettingsPage.prototype._onSignout = function () {
        /// <summary>Signs out the user's Local Id.</summary>
        var auth = new O.OnlineIdAuthenticator();
        Debug.assert(auth.canSignOut);
        if (auth.canSignOut) {
            var defaultAccount = this._account;
            var platform = this._platform;
            auth.signOutUserAsync().done(function () {
                var verb = platform.createVerb("ConnectedIdChange", "");
                platform.runResourceVerbAsync(defaultAccount, "backgroundTasks", verb);
            });
        }
    };

    PerAccountSettingsPage.prototype._resetRemovalUI = function () {
        var buttons = this._buttons;
        var messageElement = this._container.querySelector("#pasRemovalMessage");

        Jx.addClass(messageElement, "hidden");
        Jx.addClass(buttons.roamedRemove, "hidden");
        Jx.addClass(buttons.localRemove, "hidden");
        Jx.removeClass(buttons.remove, "hidden");
        this._onRemove = this._confirmRemove;

        if (this._pointerDownListener) {
            document.removeEventListener("MSPointerDown", this._pointerDownListener, true);
            this._pointerDownListener = null;
        }
    };

    PerAccountSettingsPage.prototype._confirmRemove = function () {
        var buttons = this._buttons;
        var container = this._container;
        var messageElement = container.querySelector("#pasRemovalMessage");
        var removalUiContainer = container.querySelector("#removalUI");
        var isDefaultOrPrimary = this._account.isDefault || (Plat.HintState.primaryAccount === this._account.hintState);

        // Show the warning message before we complete the signout
        Jx.removeClass(messageElement, "hidden");
        // Unfortunately, Narrator won't read the message text just because it's becoming visible.
        // We need to trick it into thinking the text changed.
        messageElement.innerText = messageElement.innerText;
        this._jobset.addUIJob(this, this._tooltipCheck, null, P.Priority.accessibility);

        if (!isDefaultOrPrimary) {
            // If there is no default account (i.e. MSA), secondary accounts
            // will not be roamed, so don't show the option to remove from all sync'd PCs.
            if (this._hasDefaultAccount()) {
                Jx.removeClass(buttons.roamedRemove, "hidden");
            }
            Jx.removeClass(buttons.localRemove, "hidden");
            Jx.addClass(buttons.remove, "hidden");
            buttons.roamedRemove.focus();
            buttons.localRemove.scrollIntoView();
        } else {
            if (this._account.isDefault) {
                this._onRemove = this._onSignout;
            } else {
                this._onRemove = this._onPrimarySignout;
            }
            buttons.remove.scrollIntoView();
        }

        this._pointerDownListener = function (ev) {
            if (_isNotContainedWithin(ev.target, removalUiContainer)) {
                this._resetRemovalUI();
            }
        } .bind(this);

        // Light-dismiss the confirmation message
        document.addEventListener("MSPointerDown", this._pointerDownListener, true);
    };

    function _looksLikeAPort(port) {
        /// <summary>Helper functions to check if the given port might be a valid port number</summary>
        /// <param name="port" type="Object"/>
        /// <return type="Boolean" />
        return (!isNaN(port) && parseInt(port, 10) > 0);
    }

    function _isNotContainedWithin(el, container) {
        /// <summary>Checks if one HTML element is not contained by another.</summary>
        /// <param name="el" type="HTMLElement"/>
        /// <param name="container" type="HTMLElement"/>
        while (el !== container && el.parentNode !== null) {
            el = el.parentNode;
        }
        return (el !== container);
    }

    function _addOption(dropDown, label, value, selected) {
        /// <summary>Helper functions to create and add a new option tag to the given drop-down control</summary>
        /// <param name="label" type="text"/>
        /// <param name="value" type="Object"/>
        /// <param name="selected" type="Boolean" optional="true"/>
        /// <return type="HTMLElement"/>
        var option = document.createElement("option");
        option.innerText = label;
        option.value = value;
        option.selected = !!selected;
        dropDown.appendChild(option);
        return option;
    }

    function _hideControlsWhere(rootElement, query) {
        /// <summary>Helper functions to hide controls that meet a specific query condition</summary>
        /// <param name="rootElement" type="HTMLElement">The element whose subtree should be queried</param>
        /// <param name="query" type="String"/>
        var elements = rootElement.querySelectorAll(query);
        Array.prototype.forEach.call(elements, function (element) {
            element.style.display = "none";
        });
    }

    function _disableControlsWhere(rootElement, query, disable) {
        /// <summary>Helper functions to disable or enables controls that meet a specific query condition</summary>
        /// <param name="rootElement" type="HTMLElement">The element whose subtree should be queried</param>
        /// <param name="query" type="String"/>
        /// <param name="disable" type="Boolean"/>
        var elements = rootElement.querySelectorAll(query);
        Array.prototype.forEach.call(elements, function (element) {
            element.disabled = disable;
            _disableControlsWhere(element, "*", disable);
        });
    }

    function _encryptPassword(passwordText) {
        /// <summary>Helper functions for encrypting a password</summary>
        /// <param name="passwordText" type="String"/>
        /// <return type="Promise"/>
        if (Jx.isNonEmptyString(passwordText)) {
            var provider = Crypto.DataProtection.DataProtectionProvider("local=user");
            var binary = Crypto.CryptographicBuffer.convertStringToBinary(passwordText, Crypto.BinaryStringEncoding.utf8);
            return provider.protectAsync(binary);
        } else {
            // The passwordText was empty. Indicating the user didn't change his password.
            // return null, so that we don't try to change it on the account object.
            return WinJS.Promise.wrap(null);
        }
    }

    var mailSpecialFolderNameMap = {};
    mailSpecialFolderNameMap[Plat.MailFolderType.sentItems] = Jx.res.getString("mailFolderNameSentItems");
    mailSpecialFolderNameMap[Plat.MailFolderType.deletedItems] = Jx.res.getString("mailFolderNameDeletedItems");
    mailSpecialFolderNameMap[Plat.MailFolderType.junkMail] = Jx.res.getString("mailFolderNameJunkMail");
    mailSpecialFolderNameMap[Plat.MailFolderType.drafts] = Jx.res.getString("mailFolderNameDrafts");
    mailSpecialFolderNameMap[Plat.MailFolderType.outbox] = Jx.res.getString("mailFolderNameOutbox");
    mailSpecialFolderNameMap[Plat.MailFolderType.inbox] = Jx.res.getString("mailFolderNameInbox");

    //
    // SpecialFoldersControl
    //
    var SpecialFoldersControl = function (platform, account) {
        this.initComponent();
        this._platform = platform;
        this._account = account;

        if (account.accountType === Plat.AccountType.imap) {
            var settings = account.getServerByType(Plat.ServerType.imap);

            // All the special folders may be on the x-list, verify that is not the case.
            var allFoldersXListed = settings.deletedItemsFolderXlist && settings.sentItemsFolderXlist && settings.junkFolderXlist;
            if (allFoldersXListed) {
                this.getUI = null;
            }
        } else {
            this.getUI = null;
        }
    };
    Jx.augment(SpecialFoldersControl, Jx.Component);

    SpecialFoldersControl.prototype.getUI = function (ui) {
        var settings = this._account.getServerByType(Plat.ServerType.imap);
        this._id = "idSpecialFoldersSettings" + Jx.uid();

        var generateSpecialFolderDropDown = function (name) {
            var labelId = "pas" + name + "Label";
            return "<div id='" + labelId + "' role='sectionhead' class='" + settings.sentItemsFolderXlist + " pas-tooltipCheck' >" + getString(labelId) + "</div>" +
                   "<select id='pas" + name + "' aria-labelledby='" + labelId + "'></select>";
        };

        ui.html =
            "<div id='" + this._id + "'>" +
                "<div id='pasSpecialFoldersLabel' role='sectionhead' class='pas-inlineInfo pas-tooltipCheck'>" + getString("pasSpecialFoldersLabel") + "</div>" +
                (!settings.sentItemsFolderXlist ? generateSpecialFolderDropDown("SentItems") : "") +
                (!settings.deletedItemsFolderXlist ? generateSpecialFolderDropDown("DeletedItems") : "") +
                (!settings.junkFolderXlist ? generateSpecialFolderDropDown("JunkEmail") : "") +
            "</div>";
    };

    SpecialFoldersControl.prototype.activateUI = function () {
        Jx.Component.prototype.activateUI.call(this);
        var container = document.getElementById(this._id);
        var account = this._account;
        var folderManager = this._platform.folderManager;

        this._folders = {
            sentItems: { dropDown: container.querySelector("#pasSentItems"), type: Plat.MailFolderType.sentItems },
            deletedItems: { dropDown: container.querySelector("#pasDeletedItems"), type: Plat.MailFolderType.deletedItems },
            junkEmail: { dropDown: container.querySelector("#pasJunkEmail"), type: Plat.MailFolderType.junkMail }
        };

        var folderOptions = this._generateFolderOptions();
        if (Jx.isNonEmptyString(folderOptions)) {
            this._forEachFolder(function (folder) {
                if (folder.dropDown) {
                    folder.dropDown.innerHTML = folderOptions;
                    folder.dropDown.value = folderManager.getImapSpecialFolderId(account, folder.type);
                }
            }, this);
        }
    };

    SpecialFoldersControl.prototype.applyChanges = function () {
        if (this.hasUI()) {
            var account = this._account;
            var folderManager = this._platform.folderManager;

            this._forEachFolder(function (folder) {
                if (folder.dropDown) {
                    if (folder.dropDown.value !== folderManager.getImapSpecialFolderId(account, folder.type)) {
                        folderManager.setImapSpecialFolderPath(account, folder.type, folder.dropDown.value);
                    }
                }
            }, this);
        }
    };

    SpecialFoldersControl.prototype._forEachFolder = function (fnCallback) {
        var folders = this._folders;
        for (var folderName in folders) {
            fnCallback.call(this, folders[folderName]);
        }
    };

    SpecialFoldersControl.prototype._generateFolderOptions = function () {
        // Generates the list of avaialable folders for each of the drops down,
        // returning it as a string of <option> elements.
        var options = [];

        var generateOption = function (name, value) {
            return "<option value='" + value + "'>" + name + "</option>";
        };

        var generateOptionsList = function (rootFolder, currentPath) {
            /// <param name="rootFolder" type="Plat.Folder"/>
            /// <param name="currentIndentation" type="String"/>
            var optionsList = [];
            var folderName = rootFolder.folderName || mailSpecialFolderNameMap[rootFolder.specialMailFolderType];
            var children = rootFolder.getChildFolderCollection(false);

            if (!rootFolder.selectionDisabled) {
                // Generate a drop-down item for the folder, the name having the currentIndentation prepended to represent hierarchy.
                optionsList.push(generateOption((currentPath + folderName), rootFolder.objectId));
            }
            if (children.count > 0) {
                for (var i = 0, count = children.count; i < count; i++) {
                    var childFolder = children.item(i);
                    // Go deeper.
                    optionsList = optionsList.concat(generateOptionsList(childFolder, (currentPath + folderName + "\\")));
                }
            }
            return optionsList;
        };

        // Iterate over the root folders, perform an depth-first-search type traversal, genarating
        // drop-down option elements for each of the sub folders as we go.
        var rootUserCollection = this._platform.folderManager.getRootFolderCollection(this._account, Plat.FolderType.mail);
        for (var i = 0, count = rootUserCollection.count; i < count; i++) {
            var rootFolder = rootUserCollection.item(i);
            if (!rootFolder.isLocalMailFolder) {
                options = options.concat(generateOptionsList(rootFolder, ""));
            }
        }
        rootUserCollection.dispose();

        options.push(generateOption("", ""));
        return options.join("");
    };

    function getString(id) { return Jx.res.getString("/accountsStrings/" + id); }
    function getCompoundString(id, values) { return Jx.res.loadCompoundString("/accountsStrings/" + id, values); }

});

