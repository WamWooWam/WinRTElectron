
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="../../Shared/JSUtil/Include.js"/>
/// <reference path="../../Shared/JSUtil/Namespace.js"/>
/// <reference path="../../Shared/Bici/Bici.js"/>
/// <reference path="../../../Shared/jx/core/jx.js"/>
/// <reference path="../../../Shared/jx/core/res.js"/>
/// <reference path="../../Shared/Platform/PlatformObjectBinder.ref.js"/>
/// <reference path="ContactDeleteFlyout.ref.js"/>

/// <dictionary>non-deletable,desc,flyout,ics,elem</dictionary>

Jx.delayDefine(People.Controls, "ContactDeleteFlyout", function () {

    $include("$(cssResources)/controls-people.css");

    /// <disable>JS2076.IdentifierIsMiscased</disable>
    var P = window.People;
    var C = P.Controls;
    var N = P.Nav;
    var Elements = P.IdentityElements;
    /// <enable>JS2076.IdentifierIsMiscased</enable>

    C.ContactDeleteFlyout = ContactDeleteFlyout;
    function ContactDeleteFlyout() {
        ///<summary>The DeleteFlyout asks the user for confirmation about which contacts to delete.</summary>
        NoShip.People.etw("profileFlyoutDeleteAction_start", { action: "ctor" });

        // Create flyout
        var div = document.createElement('div');
        div.className = "profile-flyout";
        div.setAttribute("data-win-control", "WinJS.UI.Flyout");
        div.setAttribute("aria-described-by", "delete-flyout_dsc");
        // Create template
        div.innerHTML = '<form id="delete-flyout" class="profile-flyout">' +
            '<p id="delete-flyout-text" class="profile-flyout win-body"></p>' +
            '<ul id="delete-flyout-list" class="profile-flyout"></ul>' +
            '<ul id="delete-flyout-list-3rdParty" class="profile-flyout"></ul>' +
            '<p id="delete-flyout-subText" class="profile-flyout win-body"></p>' +
            '<input type="submit" id="delete-flyout-submit"/>' +
            '<span role="note" class="profile-flyout-description" id="delete-flyout_dsc"></span>' +
            '<span role="note" class="profile-flyout-description" id="delete-flyout-check_dsc"></span>' +
            '<span role="note" class="profile-flyout-description" id="delete-flyout-ic_dsc"></span>' +
            '<span role="note" class="profile-flyout-description" id="delete-flyout-submit_dsc"></span>' +
            '</form>';

        // Attach WinJS
        var flyout = new WinJS.UI.Flyout(div);
        flyout.addEventListener("afterhide", _cleanup);

        // Retrieve elements from the template
        var form = div.querySelector('#delete-flyout');
        form.onsubmit = _submit;

        var text = form.querySelector("#delete-flyout-text");
        var list = form.querySelector("#delete-flyout-list");
        var listErrors = form.querySelector("#delete-flyout-list-3rdParty");
        var subText = form.querySelector("#delete-flyout-subText");
        var submit = form.querySelector("#delete-flyout-submit");

        var flyoutDesc = form.querySelector("#delete-flyout_dsc");
        var checkDesc = form.querySelector("#delete-flyout-check_dsc");
        var icDesc = form.querySelector("#delete-flyout-ic_dsc");
        var submitDesc = form.querySelector("#delete-flyout-submit_dsc");

        // Establish shared state.
        var contacts = [];
        var ics = [];

        // Cache the options for creating and rendering ICs.
        /// <disable>JS2076.IdentifierIsMiscased</disable>
        var IC = P.IdentityControl;
        /// <enable>JS2076.IdentifierIsMiscased</enable>

        var billboard = Elements.BillboardLayout;
        var billboardOptions = {
            size: 40,
            secondaryContent: Elements.Networks
        };

        // Update ARIA information
        var ariaLabelFlyout = Jx.res.getString("/strings/profileDelete_Label_Flyout");
        var ariaLabelCheck = Jx.res.getString("/strings/profileDelete_Label_Checkbox");
        var ariaLabelIC = Jx.res.getString("/strings/profileDelete_Label_IC");
        var ariaLabelSubmit = Jx.res.getString("/strings/profileDelete_Label_Submit");

        div.setAttribute('aria-label', ariaLabelFlyout);
        submit.setAttribute('aria-label', ariaLabelSubmit);

        var ariaDescFlyout = Jx.res.getString("/strings/profileDelete_Desc_Flyout");
        var ariaDescCheck = Jx.res.getString("/strings/profileDelete_Desc_Checkbox");
        var ariaDescIC = Jx.res.getString("/strings/profileDelete_Desc_IC");
        var ariaDescSubmit = Jx.res.getString("/strings/profileDelete_Desc_Submit");

        flyoutDesc.innerText = ariaDescFlyout;
        checkDesc.innerText = ariaDescCheck;
        icDesc.innerText = ariaDescIC;
        submitDesc.innerText = ariaDescSubmit;

        var textSubmit = Jx.res.getString("/strings/profileDelete_Submit");

        submit.type = "submit";
        submit.value = textSubmit;

        function _cleanup() {
            /// <summary>Called after the flyout is hidden to clean up references and detach from the DOM</summary>
            NoShip.People.etw("profileFlyoutDeleteAction_start", { action: "cleanup" });

            document.body.removeChild(div);
            ics.forEach(function (/*@type(P.IdentityControl)*/ic) { ic.shutdownUI(); });
            ics = [];
            NoShip.People.etw("profileFlyoutDeleteAction_end", { action: "cleanup" });
        };

        function _click() {
            /// <summary>Called when an active checkbox is clicked. Updates the state of the form.</summary>

            var checks = list.querySelectorAll("input:checked");
            submit.disabled = checks.length === 0;
        };

        function _deleteContact(/*@type(P.ContactAccessor)*/contactToDelete) {
            if (contactToDelete.canDelete) { // Contacts that have already been deleted or removed from the set will be disposed and fail this test
                try {
                    contactToDelete.deleteObject();
                } catch (ex) {
                    Jx.log.exception("Contact deletion failed", ex);
                }

                
                var mockContactToDelete =  /*@static_cast(Mocks.Microsoft.WindowsLive.Platform.Contact)*/contactToDelete;
                if (mockContactToDelete.mock$setProperty) {
                    setTimeout(function () {
                        var personAccessor = /*@static_cast(P.PersonAccessor)*/contactToDelete.person;
                        if (personAccessor) {
                            var person = personAccessor.getPlatformObject();
                            if (person) {
                                var links = /*@static_cast(Mocks.Microsoft.WindowsLive.Platform.Collection)*/person.linkedContacts;
                                if (links) {
                                    for (var i = 0; i < links.count; i++) {
                                        if (links.item(i).objectId === contactToDelete.objectId) {
                                            links.mock$removeItem(i);
                                            break;
                                        }
                                    }
                                }
                            }
                        }
                    }, 100);
                }
                
            }
        }

        function _deleteCheckedContact(/*@type(DeleteFlyoutCheckbox)*/checkbox) {
            _deleteContact(checkbox.contact);
        };

        function _submit() {
            /// <summary>Called when the Delete button is pressed. Deletes all selected contacts.</summary>
            if (flyout) {
                NoShip.People.etw("profileFlyoutDeleteAction_start", { action: "submit" });
                flyout.hide();
                flyout = null; // Prevent multiple submissions

                if (contacts.length === 1) {
                    _deleteContact(contacts[0]);
                } else {
                    var checks = list.querySelectorAll("input:checked");
                    Array.prototype.forEach.call(checks, _deleteCheckedContact);
                }

                Jx.bici.increment(Microsoft.WindowsLive.Instrumentation.Ids.People.profileDetailsDeleteContact, 1);
                NoShip.People.etw("profileFlyoutDeleteAction_end", { action: "submit" });
            }
            return false; // Override the default submit handler, since we don't want Trident to refresh the app.
        };

        this.show = function (person, anchor, placement, /*@optional*/contactToDelete) {
            /// <summary>Show this flyout relative to the anchor with the specified placement.</summary>
            /// <param name="person" type="P.PersonAccessor">The person from which to fetch linked contacts.</param>
            /// <param name="anchor" type="HTMLElement">The command bar button above which to render.</param>
            /// <param name="placement" type="String">Defines to show the flyout above or below the anchor.</param>
            NoShip.People.etw("profileFlyoutDeleteAction_start", { action: "show" });

            Debug.assert(ics.length === 0, "Old flyout not cleaned up properly");

            contacts = person.linkedContacts.slice();
            submit.disabled = false;

            if (!Jx.isNullOrUndefined(contactToDelete)) {
                Debug.assert(contacts.some(function (/*@type(P.ContactAccessor)*/contact) {
                    return contact.objectId === contactToDelete.objectId;
                }), "Cannot find the contact.");

                var hasOtherNonGALContact = contacts.some(function (/*@type(P.ContactAccessor)*/contact) {
                    return !contact.isGal && contact.objectId !== contactToDelete.objectId;
                });
                if (hasOtherNonGALContact) {
                    subText.innerText = Jx.res.getString("/strings/profileDelete_subText");
                }

                contacts = [contactToDelete];
            }

            list.innerHTML = '';
            listErrors.innerHTML = '';

            contacts.forEach(function (/*@type(P.ContactAccessor)*/contact) {
                if (!contact.isGal) {
                    var canDelete = contact.canDelete;

                    var li = document.createElement('li');

                    // Add checkboxes when there are more than one contact
                    if (contacts.length > 1) {
                        var check = document.createElement('input');
                        check.contact = contact;
                        check.type = 'checkbox';
                        check.role = 'checkbox';
                        check.setAttribute('aria-described-by', 'delete-flyout-check_dsc');
                        check.setAttribute('aria-label', ariaLabelCheck);
                        if (canDelete) {
                            check.defaultChecked = true;
                            check.checked = true;
                        } else {
                            check.disabled = true;
                        }
                        li.appendChild(check);
                    }

                    var ic = new IC(contact, null, { interactive: false } /*IC option*/);
                    var icDiv = document.createElement('div');
                    icDiv.className = 'profile-flyout-ic';
                    icDiv.role = 'img';
                    icDiv.setAttribute('aria-described-by', 'delete-flyout-ic_dsc');
                    icDiv.setAttribute('aria-label', ariaLabelIC);
                    icDiv.innerHTML = ic.getUI(billboard, billboardOptions);
                    ics.push(ic);

                    li.appendChild(icDiv);

                    // Sort order override: place non-deletable contacts on the bottom
                    var elem = canDelete ? list : listErrors;
                    elem.appendChild(li);
                }
            });

            // Add click listeners to *active* checkboxes
            var checks = list.querySelectorAll('input:checked');
            Array.prototype.forEach.call(checks, function (/*@type(HTMLElement)*/check) {
                check.addEventListener("click", _click, false);
            });

            // Update text based on state.
            var mode = listErrors.hasChildNodes() ? "2" : "1";
            text.innerText = Jx.res.getString("/strings/profileDelete_Text" + mode);

            ics.forEach(function (/*@type(P.IdentityControl)*/ic) {
                ic.activateUI(form);
            });

            // Show
            document.body.appendChild(div);
            flyout.show(anchor, placement);
            NoShip.People.etw("profileFlyoutDeleteAction_end", { action: "show" });
        };

        this.getFlyout = function () {
            /// <summary>Get the WinJS flyout object</summary>
            /// <returns type="WinJS.UI.Flyout"/>
            return flyout;
        };

        NoShip.People.etw("profileFlyoutDeleteAction_end", { action: "ctor" });
    };
});
