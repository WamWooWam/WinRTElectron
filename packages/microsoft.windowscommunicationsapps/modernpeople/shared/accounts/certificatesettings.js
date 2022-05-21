
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

Jx.delayDefine(People.Accounts, ["CertificateSettingsControl", "CertificateUtils", "CertPromptResult"], function () {

    var P = window.People;
    var A = P.Accounts;
    var Plat = Microsoft.WindowsLive.Platform;
    var DateFormating = Windows.Globalization.DateTimeFormatting;
    var Crypto = Windows.Security.Cryptography;
    var Certs = Crypto.Certificates;

    // Note: the contents of these three arrays MUST be aligned.
    var iceErrors = ["serverCertificateExpired", "serverCertificateMismatchedDomain", "serverCertificateUnknownCA"];
    var iceIgnoreFlags = ["ignoreServerCertificateExpired", "ignoreServerCertificateMismatchedDomain", "ignoreServerCertificateUnknownCA"];
    var iceErrorResIdInfix = ["Expired", "MismatchedDomain", "UnknownCA"];

    //
    // CertificateSettingsControl
    //
    var CertificateSettingsControl = A.CertificateSettingsControl = /* @constructor */function (platform, account) {
        /// <summary>This control is meant to be hosted by the PerAccountSettingsPage, or similar control.
        /// It it responsible for building the settings UI section associated with an accounts certificate settings.</summary>
        this.initComponent();
        this._iceControlsActive = false;
        this._platform = platform;
        this._account = account;
        this._selectedCert = null;

        this._settings = account.getServerByType(Plat.ServerType.eas) || account.getServerByType(Plat.ServerType.imap);
        this._smtpSettings = account.getServerByType(Plat.ServerType.smtp);

        this._mailResource = account.getResourceByType(Plat.ResourceType.mail);

        // If we don't have a mail resource, then we're not a mail account.
        if (Jx.isNullOrUndefined(this._mailResource)) {
            this.getUI = null;
        }
    };
    Jx.augment(CertificateSettingsControl, Jx.Component);

    Object.defineProperty(CertificateSettingsControl.prototype, "selectedCertificate", { get: function () { return this._selectedCert; } });

    CertificateSettingsControl.prototype.getUI = function (ui) {
        this._id = "idCertificateSettings" + Jx.uid();

        ui.html =
            "<div id='" + this._id + "'>" +
                "<div id='pasIgnorableCertSettingsContainer' class='hidden pas-settingGroup'>" +
                    "<div id='pasIgnorableCertErrorStatus' role='status' class='pas-inlineAdvise pas-tooltipCheck' data-associatedControl='pasIgnoreCertErrors'></div>" +
                    "<div id='pasDetailedCertErrors' class='hidden pas-inlineAdvise'></div>" +
                    "<div class='pas-checkbox'><label><input id='pasIgnoreCertErrors' type='checkbox' aria-label='" + Jx.escapeHtml(getString("pasIgnoreCertErrors")) + "'>" + getString("pasIgnoreCertErrors") + "</label></div>" +
                "</div>" +
                "<div id='pasCertificateBaseAuthSettingsContainer' class='hidden pas-settingGroup'>" +
                    "<div id='pasCertificateBaseAuthError' role='status' class='hidden pas-inlineAdvise pas-tooltipCheck' data-associatedControl='pasShowCertsLink'>" + getString("pasCertificateRequiredError") + "</div>" +
                    "<div id='pasCertSelectionContainer' class='hidden'>" +
                        "<label class='pas-tooltipCheck'>" + Jx.escapeHtml(getString("pasCertificateLabel")) + "</label>" +
                        "<div class='pas-link'><a id='pasShowCertsLink' tabIndex='0'>" + Jx.escapeHtml(getString("pasChoose")) + "</a></div>" +
                        "<div id='pasSelectedCert'></div>" +
                    "</div>" +
                "</div>" +
            "</div>";
    };

    CertificateSettingsControl.prototype.activateUI = function () {
        Jx.Component.prototype.activateUI.call(this);

        var container = this._container = document.getElementById(this._id);

        // Are there any ignorable certificate errors present, or are any
        // certificate errors being ignored.
        if (this._ignorableCertErrorPresent() || this._certErrorIgnored()) {

            this._iceControlsActive = true;

            var ignoreCertErrorsCheckbox = container.querySelector("#pasIgnoreCertErrors");

            // The ignorable certificate UI should be shown.
            Jx.removeClass(container.querySelector("#pasIgnorableCertSettingsContainer"), "hidden");

            // Determine if the ignore-cert-errors checkbox should be checked.
            if (!this._ignorableCertErrorPresent()) {
                ignoreCertErrorsCheckbox.checked = true;
            }

            var activeErrors = iceErrors.filter(function (error) {
                return this._mailResource[error];
            }.bind(this));

            var genericErrorMsg = (activeErrors.length > 1 ? getString("iceGenericMessage_multiple") : getString("iceGenericMessage"));
            container.querySelector("#pasIgnorableCertErrorStatus").innerHTML = Jx.res.loadCompoundString("/accountsStrings/pasIgnorableCertDetailsLink", genericErrorMsg);

            // Hookup the 'details' link.
            var detailsLink = container.querySelector("#pasIgnorableCertErrorStatus").querySelector("a");
            detailsLink.tabIndex = 0;
            detailsLink.id = "pasShowDetailsLink";
            detailsLink.addEventListener("click", this._showDetails.bind(this, true /*true*/), false);
            detailsLink.addEventListener("keydown", function (ev) { if (ev.key === "Spacebar" || ev.key === "Enter") { this._showDetails(true/*show*/); } }.bind(this), false);

            // Listen for changes to the ignore-cert-errors checkbox.
            ignoreCertErrorsCheckbox.addEventListener("change", function () {
                if (ignoreCertErrorsCheckbox.checked) {
                    // Ensure the the error details are hidden, and the "details" link visible.
                    this._showDetails(false);
                }
            }.bind(this));
        }

        // Check to see if we need to display the certificate-selection UI.
        if (this._isCbaAccount()) {
            //In this case, there was a certificate-base authentication (CBA) error. Tell the user
            // that a certificate is needed, and allow them to pick one.
            Jx.removeClass(container.querySelector("#pasCertificateBaseAuthSettingsContainer"), "hidden");
            this._setupCertSelectionUI();

            // Show the CBA error message, if there is an error.
            Jx.setClass(container.querySelector("#pasCertificateBaseAuthError"), "hidden", this._mailResource.lastSyncResult !== Plat.Result.e_SYNC_CBA_FAILED);

            if (Jx.isObject(this._settings.certificateThumbPrint)) {
                // the account has a selected--apparently valid--certificate, show the UI.

                // Fetch the actaul certificate object.
                var certObject = this._platform.accountManager.queryForCertificate(this._settings.certificateThumbPrint);
                Debug.assert(Jx.isObject(certObject), "Certificate not found");

                // Display the certificate to the user.
                if (Jx.isObject(certObject)) {
                    // Cache the currently-selected certificate.
                    this._selectedCert = certObject;

                    container.querySelector("#pasSelectedCert").innerHTML = this._generateCertItemHtml(certObject);
                }
            }
        }
    };

    CertificateSettingsControl.prototype._isCbaAccount = function () {
        return this._mailResource.lastSyncResult === Plat.Result.e_SYNC_CBA_FAILED || Jx.isObject(this._settings.certificateThumbPrint);
    };

    CertificateSettingsControl.prototype._setupCertSelectionUI = function () {
        /// <summary>Query for and cache the list of available certificates.</summary>
        var certs = this._availableCerts = this._platform.accountManager.queryForCertificateCollection(this._account);

        if (Jx.isObject(certs) && certs.count > 0) {
            var container = this._container;

            // There are certificates to choose, show the selection UI.
            Jx.removeClass(container.querySelector("#pasCertSelectionContainer"), "hidden");

            // Hookup the 'choose' link.
            var chooseLink = container.querySelector("#pasShowCertsLink");
            chooseLink.addEventListener("click", this._showCerts.bind(this), false);
            chooseLink.addEventListener("keydown", function (ev) { if (ev.key === "Spacebar" || ev.key === "Enter") { this._showCerts(); } }.bind(this), false);
        }
    };

    CertificateSettingsControl.prototype._ignorableCertErrorPresent = function () {
        return iceErrors.some(function (error) {
            return this._mailResource[error];
        }.bind(this));
    };

    CertificateSettingsControl.prototype._certErrorIgnored = function () {
        return iceIgnoreFlags.some(function (flag) {
            return this._settings[flag];
        }.bind(this));
    };
    
    CertificateSettingsControl.prototype._showDetails = function (show) {
        /// <summary>Handler for the "detail" link, which shows detailed error messages for
        /// the active ignorable certficate error(s).</summary>
        /// <param name="show" type="Boolean">Whether or not the details info should be shown or hidden.</param>
        var errorMessagesHtml = "";

        var errorDetailsContainer = this._container.querySelector("#pasDetailedCertErrors");

        if (!errorDetailsContainer.hasChildNodes()) {

            // Based on the current ignorable certificate errors active, build their corresponding UI to notify the user.
            iceErrors.forEach(function (error, index) {
                if (this._mailResource[error] || this._settings[iceIgnoreFlags[index]]) {
                    var infix = iceErrorResIdInfix[index];
                    errorMessagesHtml += "<div>" + getString("ice_" + infix + "_Brief") + "</div>" +
                                         "<div>" + getString("ice_" + infix + "_Detailed") + "</div><br>";
                }
            }.bind(this));

            Debug.assert(Jx.isNonEmptyString(errorMessagesHtml), "Should have have some errors");
            errorDetailsContainer.innerHTML = errorMessagesHtml;
        }

        // Hide the "details" link, i.e. add the "hidden" class.
        Jx.setClass(this._container.querySelector("#pasShowDetailsLink"), "hidden", show);

        // Show the errors, i.e. remove the "hidden" class.
        Jx.setClass(errorDetailsContainer, "hidden", !show);
    };

    CertificateSettingsControl.prototype._showCerts = function () {
        /// <summary>Launches a flyout containing the list of available certificates
        /// for the user to select.</summary>
        Debug.assert(Jx.isObject(this._availableCerts) && (this._availableCerts.count > 0), "This code shouldn't be hit if we don't have any certificates.");

        var certs = this._availableCerts;

        var isSelectedCert = function (cert) {
            if (Jx.isObject(this._selectedCert)) {
                return this._certsMatch(cert.thumbPrint, this._selectedCert.thumbPrint);
            }
            return false;
        }.bind(this);

        // Build the list of certificate flyout items;
        var listItems = [];
        for (var i = 0; i < certs.count; i++) {
            var cert = certs.item(i);
            listItems.push({
                html: this._generateCertItemHtml(cert),
                id: i,
                selected: isSelectedCert(cert),
                onItemSelected: this._onCertSelected.bind(this, cert)
            });
        }

        var flyout = new P.Flyout(listItems);
        var flyoutElement = flyout.getFlyoutElement();
        Jx.addClass(flyoutElement, "certMenu");

        flyout.show(this._container.querySelector("#pasShowCertsLink"), "top", "left", function () {
            flyout.dispose();
        }.bind(this));
    };

    CertificateSettingsControl.prototype._onCertSelected = function (cert) {
        /// <summary>Handler for a certificate item in the flyout, when it is clicked by the user.</summary>
        
        // Set the thumbprint of the selected certificate
        this._selectedCert = cert;

        // Update the UI to show the newly-selected one.
        this._container.querySelector("#pasSelectedCert").innerHTML = this._generateCertItemHtml(cert);
    };

    CertificateSettingsControl.prototype._certsMatch = function (certTumbprint1, certTumbprint2) {
        /// <summary>Given two certificate thumbprints, checks to see if they match exactly.</summary>
        if (!certTumbprint1 || !certTumbprint2) {
            return false;
        }
        // The certificate thumbprints array essentially an array of bytes. Only it's not exposed to us
        // as an array.
        var thumbprintString1 = Array.prototype.reduce.call(certTumbprint1, function (previousVal, value) {
                return previousVal += value;
            }, "");

        var thumbprintString2 = Array.prototype.reduce.call(certTumbprint2, function (previousVal, value) {
                return previousVal += value;
            }, "");

        return thumbprintString1 === thumbprintString2;
    }

    CertificateSettingsControl.prototype._generateCertItemHtml = function (cert) {
        /// <summary>Builds the HTML string to represent a single certificate.</summary>

        // Format the dates like MM/dd/yyy, in a locale-sensitive manner.
        var validFrom = DateFormating.DateTimeFormatter.shortDate.format(cert.validFrom);
        var validTo = DateFormating.DateTimeFormatter.shortDate.format(cert.validTo);

        var html = "<div class='pas-certItem'>" + 
                        "<div>" + Jx.escapeHtml(cert.subject) + "</div>" +
                        "<div class='typeSizeSmall'>" + Jx.escapeHtml(Jx.res.loadCompoundString("/accountsStrings/pasCertIssuer", Jx.escapeHtml(cert.issuer))) + "</div>" +
                        "<div class='typeSizeSmall'>" + Jx.escapeHtml(Jx.res.loadCompoundString("/accountsStrings/pasCertValidFrom", validFrom, validTo)) + "</div>" +
                   "</div>";

        return html;
    };

    CertificateSettingsControl.prototype.applyChanges = function () {
        /// <summary>Checks for any changes made to the certificate settings and applies
        /// them to the account object. Note: this does not actually commit the changes.
        /// The hosting control is expected to do so.</summary>
        /// <return type="Boolean">Returns true if changes were made.</return>
        var changesMade = false;

        if (this.hasUI()) {

            if (this._iceControlsActive) {
                var ignoreCertErrorsCheckbox = this._container.querySelector("#pasIgnoreCertErrors");

                // Update all the ignore flags, as neccessary.
                iceErrors.forEach(function (error, i) {
                    if (this._mailResource[error] || this._settings[iceIgnoreFlags[i]]) {
                        if (this._settings[iceIgnoreFlags[i]] !== ignoreCertErrorsCheckbox.checked) {
                            changesMade = true;
                            this._settings[iceIgnoreFlags[i]] = ignoreCertErrorsCheckbox.checked;
                            if (this._smtpSettings) {
                                this._smtpSettings[iceIgnoreFlags[i]] = ignoreCertErrorsCheckbox.checked;
                            }
                            if (ignoreCertErrorsCheckbox.checked) {
                                this._mailResource[error] = false; // Clear the error.
                            }
                        }
                    }
                }.bind(this));
            }

            if (Jx.isObject(this._selectedCert) && (!this._certsMatch(this._selectedCert.thumbPrint, this._settings.certificateThumbPrint))) {
                this._settings.certificateThumbPrint = this._selectedCert.thumbPrint;
                changesMade = true;
            }
        }
        return changesMade;
    };

    function getString(id) { return Jx.res.getString("/accountsStrings/" + id); };

    A.CertificateUtils = {};
    var CertPromptResult = A.CertPromptResult = {
        accessGranted: "Accounts.CertPromptResult.accessGranted",
        accessDenied: "Accounts.CertPromptResult.accessDenied",
        failedToOpenKey: "Accounts.CertPromptResult.failedToOpenKey"
    };
    Object.freeze(CertPromptResult);

    A.CertificateUtils.invokeCertificatePromptIfNeededAsync = function (cert) {
        /// <summary>For the given certificate, checks if it's strongly protected.
        /// If so, invokes code which will prompt the user to grant access to our
        /// app to use the certificate, as needed. Note: if the user has already
        /// granted accesss, this should be a no-op.</summary>
        /// <param name="cert" type="Plat.CertificateObject"/>
        /// <return type="WinJS.Promise"/>
        Debug.assert(Jx.isObject(cert) && Jx.isObject(cert.certificate));
        Jx.log.info("Running invokeCertificatePromptIfNeeded");

        var certInternal = cert.certificate;

        var openKeyAsync = Crypto.Core.PersistedKeyProvider.openKeyPairFromCertificateAsync;
        return openKeyAsync(certInternal,
                        Crypto.Core.HashAlgorithmNames.sha1,
                        Crypto.Core.CryptographicPadding.rsaPkcs1V15
                        ).then(function (obtainedKey) {
                            if (Jx.isObject(obtainedKey)) {
                                var myKey = obtainedKey;
                                var keysize = myKey.keySize;
                                //get some random blob. The smaller the buffer, the faster the
                                //sign. We don't really need the signed buffer, just the invoked prompt.
                                var myBuffer = Crypto.CryptographicBuffer.generateRandom(1);
                                // This will show the credential prompt, if needed, so that the
                                // user can granted us permission to user the certificate.
                                return Crypto.Core.CryptographicEngine.signAsync(myKey, myBuffer);
                            }
                            return WinJS.Promise.wrapError(A.CertPromptResult.failedToOpenKey);
                        }).then(function () {
                            Jx.log.info("invokeCertificatePromptIfNeededAsync successful");
                            return WinJS.Promise.wrap(A.CertPromptResult.accessGranted);
                        },
                        function (err) {
                            Jx.log.exception("Exception in invokeCertificatePromptIfNeededAsync", err);
                            return WinJS.Promise.wrapError(A.CertPromptResult.accessDenied);
                        });
    }

});
