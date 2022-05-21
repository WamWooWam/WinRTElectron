
//
// Copyright (C) Microsoft. All rights reserved.
//

/// <reference path="messagebar.js" />

Jx.delayDefine(Chat, "SyncMessageBarFlyout", function () {

    var plat = Microsoft.WindowsLive.Platform;

    Chat.SyncMessageBarFlyout = /*constructor*/function () {
    };

    var proto = Chat.SyncMessageBarFlyout.prototype;

    proto._email = null;
    proto._syncComplianceResults = null;
    proto._enforceableErrors = false;
    proto._flyout = null;
    proto._flyoutTemplate = null;
    proto._flyoutContent = null;
    proto._anchor = /*@static_cast(HTMLElement)*/null;

    proto.init = function (emailAddress, syncComplianceResults, enforceableErrors) {
        /// <summary>SyncMessageBarFlyout init</summary>
        /// <param name="emailAddress" type="string" />
        /// <param name="easComplianceResults" type="Microsoft.WindowsLive.Platform.PolicyComplianceResults" />
        /// <param name="enforceableErrors" type="Boolean">Indicates whether any of the policy errors are considered enforceable </param>

        Debug.assert(Jx.isNonEmptyString(emailAddress));
        Debug.assert(Jx.isNumber(syncComplianceResults));

        this._email = emailAddress;
        this._syncComplianceResults = syncComplianceResults;
        this._enforceableErrors = enforceableErrors;

        if (!this._flyout) {
            this._createFlyout();
        }
    };

    proto.show = function (anchor, position) {
        /// <summary>
        /// Show the SyncMessageBarFlyout
        /// </summary>
        /// <param name="anchor" type="HTMLElement" />
        /// <param name="position" type="string" />

        Debug.assert(Jx.isHTMLElement(anchor));
        Debug.assert(Jx.isNonEmptyString(position));

        this._anchor = anchor;

        this._generateFlyoutContent();
        this._flyout.show(anchor, position);
    };

    proto._createFlyout = function () {
        var flyoutElement = document.createElement("div");
        flyoutElement.setAttribute("data-win-control", "WinJS.UI.Flyout");
        document.body.appendChild(flyoutElement);

        var flyoutContainer = document.createElement("div");
        flyoutContainer.setAttribute("id", "flyoutContainer");
        flyoutElement.appendChild(flyoutContainer);

        this._flyout = new WinJS.UI.Flyout(flyoutElement);
        this._flyout.addEventListener("afterhide", this._afterHide.bind(this));

        this._flyoutTemplate = document.createElement("div");
        this._flyoutTemplate.setAttribute("id", "flyoutContent");
        this._flyoutTemplate.innerHTML = Jx.Templates.MessageBar.syncFlyout();
        
	Jx.res.processAll(this._flyoutTemplate);
    };

    proto._afterHide = function () {
        Debug.assert(Jx.isHTMLElement(this._anchor));

        // To get the focus rectangle on the 'More details' link
        // you have to lose focus and then get it back again
        this._anchor.blur();
        this._anchor.focus();
    };

    proto._generateFlyoutContent = function () {

        var complianceResults = plat.PolicyComplianceResults;

        var flyoutContainer = this._flyout.element.querySelector("#flyoutContainer");

        // remove the previous content
        if (Jx.isHTMLElement(this._flyoutContent)) {
            flyoutContainer.removeChild(this._flyoutContent);
        }

        // create new content element and add it to the flyout
        this._flyoutContent = this._flyoutTemplate.cloneNode(true);
        flyoutContainer.appendChild(this._flyoutContent);

        var hiddenClassName = "mbhidden";

        // If we have problems with any policies we can potentially enforce, show those first and help
        // the user get to either partial or full compliance.
        if (this._enforceableErrors) {
            this._showApplyPolicyContent();
        } else {
            // If we don't have any problems we can potentially fix, show the user the list of reasons why the server
            // isn't letting them sync.
            this._showUnableToComplyContent();
        }
    };

    proto._showApplyPolicyContent = function () {
        var complianceResults = plat.PolicyComplianceResults,
            hiddenClassName = "mbhidden",
            applyPolicyContent = this._flyoutContent.querySelector("#applyPolicyContent");

        Jx.removeClass(applyPolicyContent, hiddenClassName);

        // individually show or hide the list items
        if ((this._syncComplianceResults & complianceResults.userNotAnAdmin) === complianceResults.userNotAnAdmin) {
            var adminNeededItem = applyPolicyContent.querySelector("#adminNeededItem");
            Jx.removeClass(adminNeededItem, hiddenClassName);
        }

        if ((this._syncComplianceResults & complianceResults.userCanceledPolicyDialog) === complianceResults.userCanceledPolicyDialog ||
            this._syncComplianceResults === complianceResults.compliant) {
            // if compliance results says that the user is compliant, it basically means the user just has to continue with the operation
            var userClickedCancelItem = applyPolicyContent.querySelector("#userClickedCancelItem");
            Jx.removeClass(userClickedCancelItem, hiddenClassName);
        }

        if ((this._syncComplianceResults & complianceResults.usersCannotChangePassword) === complianceResults.usersCannotChangePassword) {
            var usersCanChangePwdItem = applyPolicyContent.querySelector("#usersCanChangePwdItem");
            Jx.removeClass(usersCanChangePwdItem, hiddenClassName);
        }

        if ((this._syncComplianceResults & complianceResults.connectedUserPasswordIsWeak) === complianceResults.connectedUserPasswordIsWeak ||
            (this._syncComplianceResults & complianceResults.userHasBlankPassword) === complianceResults.userHasBlankPassword) {
            var connectedUserPwdItem = applyPolicyContent.querySelector("#connectedUserPwdItem");
            Jx.removeClass(connectedUserPwdItem, hiddenClassName);
        }

        if ((this._syncComplianceResults & complianceResults.connectedAdminPasswordIsWeak) === complianceResults.connectedAdminPasswordIsWeak ||
            (this._syncComplianceResults & complianceResults.adminsHaveBlankPasswords) === complianceResults.adminsHaveBlankPasswords) {
            var connectedAdminPwdItem = applyPolicyContent.querySelector("#connectedAdminPwdItem");
            Jx.removeClass(connectedAdminPwdItem, hiddenClassName);
        }

        if ((this._syncComplianceResults & complianceResults.notProtectedBitLocker) === complianceResults.notProtectedBitLocker) {
            var bitLockerNotEnabledItem = applyPolicyContent.querySelector("#notProtectedBitLockerItem");
            Jx.removeClass(bitLockerNotEnabledItem, hiddenClassName);
        }

        if ((this._syncComplianceResults & complianceResults.notProtected3rdParty) === complianceResults.notProtected3rdParty) {
            var bitLockerNotEnabledItem = applyPolicyContent.querySelector("#notProtected3rdPartyItem");
            Jx.removeClass(bitLockerNotEnabledItem, hiddenClassName);
        }

        if ((this._syncComplianceResults & complianceResults.protectionSuspendedBitLocker) === complianceResults.protectionSuspendedBitLocker) {
            var deSuspendedItem = applyPolicyContent.querySelector("#protectionSuspendedBitLockerItem");
            Jx.removeClass(deSuspendedItem, hiddenClassName);
        }

        if ((this._syncComplianceResults & complianceResults.protectionSuspended3rdParty) === complianceResults.protectionSuspended3rdParty) {
            var deNotEnabledItem = applyPolicyContent.querySelector("#protectionSuspended3rdPartyItem");
            Jx.removeClass(deNotEnabledItem, hiddenClassName);
        }

        if ((this._syncComplianceResults & complianceResults.osVolumeNotProtectedBitLocker) === complianceResults.osVolumeNotProtectedBitLocker) {
            var bitLockerNotEnabledItem = applyPolicyContent.querySelector("#osVolumeNotProtectedBitLockerItem");
            Jx.removeClass(bitLockerNotEnabledItem, hiddenClassName);
        }

        if ((this._syncComplianceResults & complianceResults.osVolumeNotProtected3rdParty) === complianceResults.osVolumeNotProtected3rdParty) {
            var bitLockerNotEnabledItem = applyPolicyContent.querySelector("#osVolumeNotProtected3rdPartyItem");
            Jx.removeClass(bitLockerNotEnabledItem, hiddenClassName);
        }

        if ((this._syncComplianceResults & complianceResults.protectionNotYetEnabledBitLocker) === complianceResults.protectionNotYetEnabledBitLocker) {
            var deSuspendedItem = applyPolicyContent.querySelector("#protectionNotYetEnabledBitLockerItem");
            Jx.removeClass(deSuspendedItem, hiddenClassName);
        }

        if ((this._syncComplianceResults & complianceResults.protectionNotYetEnabled3rdParty) === complianceResults.protectionNotYetEnabled3rdParty) {
            var deNotEnabledItem = applyPolicyContent.querySelector("#protectionNotYetEnabled3rdPartyItem");
            Jx.removeClass(deNotEnabledItem, hiddenClassName);
        }
    };

    proto._showUnableToComplyContent = function () {
        var complianceResults = plat.PolicyComplianceResults,
            hiddenClassName = "mbhidden",
            unableToComplyContent = this._flyoutContent.querySelector("#unableToComplyContent");

        Jx.removeClass(unableToComplyContent, hiddenClassName);

        // set the description
        var unableToComplyDesc = unableToComplyContent.querySelector("#unableToComplyDesc");
        unableToComplyDesc.innerText = Jx.res.loadCompoundString("/messageBar/flyoutUnableToComplyDescription", this._email);

        // individually unhide relevant items
        if ((this._syncComplianceResults & complianceResults.connectedUserProviderIsWeak) === complianceResults.connectedUserProviderIsWeak) {
            var connectedUserProviderItem = unableToComplyContent.querySelector("#connectedUserProviderItem");
            Jx.removeClass(connectedUserProviderItem, hiddenClassName);
        }

        if ((this._syncComplianceResults & complianceResults.connectedAdminProviderIsWeak) === complianceResults.connectedAdminProviderIsWeak) {
            var connectedAdminProviderItem = unableToComplyContent.querySelector("#connectedAdminProviderItem");
            Jx.removeClass(connectedAdminProviderItem, hiddenClassName);
        }

        if ((this._syncComplianceResults & complianceResults.lockNotConfiguredBitLocker) === complianceResults.lockNotConfiguredBitLocker) {
            var bitLockerNotSupportedItem = unableToComplyContent.querySelector("#lockNotConfiguredBitLockerItem");
            Jx.removeClass(bitLockerNotSupportedItem, hiddenClassName);
        }

        if ((this._syncComplianceResults & complianceResults.lockNotConfigured3rdParty) === complianceResults.lockNotConfigured3rdParty) {
            var bitLockerNotSupportedItem = unableToComplyContent.querySelector("#lockNotConfigured3rdPartyItem");
            Jx.removeClass(bitLockerNotSupportedItem, hiddenClassName);
        }

        if ((this._syncComplianceResults & complianceResults.noFeatureLicenseBitLocker) === complianceResults.noFeatureLicenseBitLocker) {
            var bitLockerNotSupportedItem = unableToComplyContent.querySelector("#noFeatureLicenseBitLockerItem");
            Jx.removeClass(bitLockerNotSupportedItem, hiddenClassName);
        }

        if ((this._syncComplianceResults & complianceResults.noFeatureLicense3rdParty) === complianceResults.noFeatureLicense3rdParty) {
            var bitLockerNotSupportedItem = unableToComplyContent.querySelector("#noFeatureLicense3rdPartyItem");
            Jx.removeClass(bitLockerNotSupportedItem, hiddenClassName);
        }

        if ((this._syncComplianceResults & complianceResults.unExpectedFailure) === complianceResults.unExpectedFailure) {
            var bitLockerNotSupportedItem = unableToComplyContent.querySelector("#unExpectedFailureItem");
            Jx.removeClass(bitLockerNotSupportedItem, hiddenClassName);
        }
    };
});
