
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="../../Shared/JSUtil/Namespace.js"/>
/// <reference path="../../../Shared/jx/core/jx.js"/>
/// <reference path="../../Shared/Navigation/UriGenerator.js"/>

Jx.delayDefine(People.Controls, "ContactEditFlyout", function () {

    $include("$(cssResources)/controls-people.css");

    /// <disable>JS2076.IdentifierIsMiscased</disable>
    var P = window.People;
    var C = P.Controls;
    var N = P.Nav;
    /// <enable>JS2076.IdentifierIsMiscased</enable>

    C.ContactEditFlyout = ContactEditFlyout;
    function ContactEditFlyout() {
        ///<summary>The EditFlyout asks the user which contact to edit when there are multiple.</summary>
        NoShip.People.etw("profileFlyoutEditAction_start", { action: "ctor" });

        // Create flyout
        var div = document.createElement('div');
        div.className = "win-menu profile-flyout";
        div.setAttribute("data-win-control", "WinJS.UI.Flyout");
        div.setAttribute("aria-described-by", "edit-flyout_dsc");
        // Create template
        div.innerHTML = '<form id="edit-flyout" class="profile-flyout">' +
                '<div id="edit-flyout-list" class="profile-flyout-list">' +
                '<span class="profile-flyout-description" id="edit-flyout_dsc" role="note"/>' +
                '</form>';

        // Attach WinJS
        var flyout = new WinJS.UI.Flyout(div);
        var navData = { isNav: false, personId: null, contactId: null };
        flyout.addEventListener("afterhide", function () {
            if (navData.isNav) {
                navData.isNav = false;
                N.navigate(N.getEditProfileDetailUri(navData.personId, { contactId: navData.contactId }));
            }
            _cleanup();
        });

        // Retrieve elements from the template
        var form = div.querySelector('#edit-flyout');
        var list = form.querySelector("#edit-flyout-list");
        var flyoutDesc = form.querySelector('#edit-flyout_dsc');

        function _cleanup() {
            /// <summary>Called after the flyout is hidden to clean up references and detach from the DOM</summary>
            NoShip.People.etw("profileFlyoutEditAction_start", { action: "cleanup" });
            document.body.removeChild(div);
            NoShip.People.etw("profileFlyoutEditAction_end", { action: "cleanup" });
        };

        this.show = function (person, anchor) {
            /// <summary>Show this flyout above the command bar.</summary>
            /// <param name="person" type="P.PersonAccessor">The person from which to fetch linked contacts.</param>
            /// <param name="anchor" type="HTMLElement">The command bar button above which to render.</param>
            NoShip.People.etw("profileFlyoutEditAction_start", { action: "show" });

            var personId = person.objectId;

            list.innerHTML = '';
            person.linkedContacts.forEach(function (/*@type(P.ContactAccessor)*/contact) {
                if (!contact.canEdit) {
                    return;
                }

                var button = document.createElement('button');
                button.setAttribute("type", "button");
                button.className = "win-command";

                button.onclick = function (/*@type(Event)*/evt) {
                    navData.personId = personId;
                    navData.contactId = contact.objectId;
                    navData.isNav = true;
                    flyout.hide();
                    evt.stopPropagation();
                    return false;
                };

                var account = contact.account;
                if (account) {
                    var accountName = account.displayName;
                    if (!Jx.isNonEmptyString(accountName)) {
                        return;
                    }

                    button.innerText = accountName;

                    list.appendChild(button);
                }
            });

            document.body.appendChild(div);
            flyout.show(anchor, 'top');
            NoShip.People.etw("profileFlyoutEditAction_end", { action: "show" });
        };

        this.getFlyout = function () {
            /// <summary>Get the WinJS flyout object</summary>
            /// <returns type="WinJS.UI.Flyout"/>
            return flyout;
        };
 
        NoShip.People.etw("profileFlyoutEditAction_end", { action: "ctor" });
    };
});
