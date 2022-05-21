
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="../JsUtil/namespace.js" />
/// <reference path="../../../shared/Jx/Core/Jx.dep.js" />

/*global Windows,Jx,Debug,People*/

Jx.delayDefine(People, 'ContactCard', function () {
    var P = People;
    var ContactCard = P.ContactCard = {};
    var ContactsNS = Windows.ApplicationModel.Contacts;
    var Placement = Windows.UI.Popups.Placement;
    
    function getWindowsContact(person, account) {
        /// <summary>Gets the Windows Contact object from the platform and augments it</summary>
        /// <param name="person" type="Microsoft.WindowsLive.Platform.IPerson">The person object to extract the contact from</param>
        /// <param name="account" type="Microsoft.WindowsLive.Platform.IAccount" optional="True">A contextual account - if the contact doesn't exist, it should be added to this account</param>
        /// <returns>A fully populated Windows Contact object</returns>
        var contact = null;

        try {
            // Getting the contact can throw under a variety of data-specific circumstances
            contact = person.getWindowsContact();
        } catch (err) {
            Jx.log.exception('People.ContactCard.getWindowsContact - Failed to get Contact from the platform for person: ' + person.objectId, err);
        }

        if (contact) {
            if (person.objectType === 'SearchPerson') {
                // The address well disposes the search collection immediately after completing the search, deleting
                // the thumbnail file. In order to prevent the contact card from throwing an exception due to the
                // missing file, we nullify the thumbnail for all SearchPerson contact objects. The side-effect is
                // that search results never have a thumbnail in the contact card, even if the collection is not
                // disposed too early.
                contact.thumbnail = null;
            }

            contact.providerProperties.insert('augmented', true);
            
            if (account) {
                Debug.assert(Jx.isNonEmptyString(account.objectId), 'Jx.isNonEmptyString(account.objectId)');
                contact.providerProperties.insert('accountId', account.objectId);
            }
        }
        
        return contact;
    }
    
    ContactCard.show = function (person, element, account) {
        /// <summary>Show the contact card for a given person.</summary>
        /// <param name="person" type="Microsoft.WindowsLive.Platform.IPerson">The containing element.</param>
        /// <param name="element" type="HTMLElement">The element to position relative to.</param>
        /// <param name="account" type="Microsoft.WindowsLive.Platform.IAccount" optional="True">A contextual account - if the contact doesn't exist, it should be added to this account</param>
        Debug.assert(Jx.isObject(person), 'Jx.isObject(person)');
        Debug.assert(Jx.isNonEmptyString(person.objectId), 'Jx.isNonEmptyString(person.objectId)');
        Debug.assert(Jx.isObject(element), 'Jx.isObject(element)');
        Debug.assert(Jx.isNullOrUndefined(account) || (Jx.isObject(account) && Jx.isNonEmptyString(account.objectId)), 'Jx.isNullOrUndefined(account) || (Jx.isObject(account) && Jx.isNonEmptyString(account.objectId))');

        // Try to get the contact, this may fail for any number of reasons
        var contact = getWindowsContact(person, account);

        if (contact) {
            // Create the bounding rectangle
            var boundingRect = element.getBoundingClientRect();
            var selectionRect = {
                x: boundingRect.left,
                y: boundingRect.top,
                width: boundingRect.width,
                height: boundingRect.height
            };

            var delayedDataLoader;
            
            try {
                // Launch the contact card
                delayedDataLoader = ContactsNS.ContactManager.showDelayLoadedContactCard(
                    contact,
                    selectionRect,
                    Placement.below);
            } catch (err) {
                Jx.log.exception('People.ContactCard.show - Call to showDelayLoadedContactCard failed', err);
            }
                
            if (delayedDataLoader) {
                Debug.assert(Jx.isObject(delayedDataLoader), 'Jx.isObject(delayedDataLoader)');
                Debug.assert(Jx.isFunction(delayedDataLoader.setData), 'Jx.isFunction(delayedDataLoader.setData)');
                Debug.assert(Jx.isFunction(delayedDataLoader.close), 'Jx.isFunction(delayedDataLoader.close)');

                Jx.log.info('Attempting to call augmentViaServerAsync on person: ' + person.objectId);
                
                // Attempt to augment the user as a foreground task
                person.augmentViaServerAsync(false).done(function complete() {
                    Jx.log.info('augmentViaServerAsync completed successfully for person: ' + person.objectId);
                    var contact = getWindowsContact(person, account);

                    if (contact) {
                        delayedDataLoader.setData(contact);
                    } else {
                        Jx.log.error('People.ContactCard.show - Unable to get a valid contact object after augmentation for person: ' + person.objectId);
                        delayedDataLoader.close();
                    }
                }, function error(err) {
                    Jx.log.exception('augmentViaServerAsync returned error for person: ' + person.objectId, err);
                    delayedDataLoader.close();
                });
            }
        } else {
            Jx.log.error('People.ContactCard.show - Unable to get a valid contact object for person: ' + person.objectId);
        }
    };
});
