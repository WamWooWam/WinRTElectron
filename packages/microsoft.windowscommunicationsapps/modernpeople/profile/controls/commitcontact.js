
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="../../Shared/JSUtil/Include.js"/>
/// <reference path="../../Shared/JSUtil/Namespace.js"/>

Jx.delayDefine(People, "CommitContact", function () {

    var P = window.People;

    /// <disable>JS2076.IdentifierIsMiscased</disable>
    var CommitContact = P.CommitContact = /*@constructor*/function (contact, person, callback, /*@dynamic*/context) {
        ///<summary>Commits a contact and invokes the specified callback with the resultant person object after aggregation has commpleted, or a timeout expires</summary>
        ///<param name="contact" type="Microsoft.WindowsLive.Platform.IContact">The contact to commit</param>
        ///<param name="person" type="Microsoft.WindowsLive.Platform.IPerson">The (optional) person to link with the new contact</param>
        ///<param name="callback" type="Function">A callback that will be invoked when the contact is committed and the person is available</param>
        ///<param name="context" optional="true"/>
        Debug.assert(Jx.isObject(contact), "Invalid parameter: contact");
        Debug.assert(Jx.isNullOrUndefined(person) || Jx.isObject(person), "Invalid parameter: person");
        Debug.assert(Jx.isFunction(callback), "Invalid parameter: callback");
        Debug.assert(Jx.isNullOrUndefined(context) || Jx.isObject(context), "Invalid parameter: context");

        this._personListener = null;
        this._contactListener = null;

        this._callback = callback;
        this._context = context;
        this._contact = contact;
        this._person = person;

        this._timeout = setTimeout(this._onTimeout.bind(this), 5000);

        try {
            if (/*@static_cast(Boolean)*/person && !contact.person) {
                person.addEventListener("changed", this._personListener = this._onPersonChanged.bind(this));
                person.commitAndLink(contact);
            } else {
                contact.addEventListener("changed", this._contactListener = this._onContactChanged.bind(this));
                contact.commit();
                if (contact.person) {
                    this._onComplete();
                }
            }
        } catch (ex) {
            Jx.log.exception("Error committing contact", ex);
            this._onComplete();
        }
    };
    /// <enable>JS2076.IdentifierIsMiscased</enable>
    CommitContact.prototype = {
        _onPersonChanged: function (evt) {
            /// <param name="evt" type="Event" />
            if (Array.prototype.indexOf.call(evt, "manualLinkCompleted") !== -1) {
                this._onComplete();
            }
        },

        _onContactChanged: function (evt) {
            /// <param name="evt" type="Event" />
            if (this._contact.person !== null) {
                this._onComplete();
            }
        },

        _onTimeout: function () {
            Debug.assert(false, "Contact was committed without error, but changed event was not recieved");
            this._onComplete();
        },

        _onComplete: function () {
            var callback = this._callback;
            var context = this._context;
            var person = this._contact ? this._contact.person : null;

            this.dispose();

            if (callback) {
                callback.call(context, person);
            }
        },

        dispose: function () {
            this._callback = null;
            this._context = null;
            
            var contactListener = this._contactListener;
            this._contactListener = null;

            var contact = this._contact;
            this._contact = null;

            var personListener = this._personListener;
            this._personListener = null;

            var person = this._person;
            this._person = null;

            var timeout = this._timeout;
            this._timeout = 0;

            if (timeout) {
                clearTimeout(timeout);
            }

            try {
                if (personListener) {
                    person.removeEventListener("changed", personListener);
                }
                if (contactListener) {
                    contact.removeEventListener("changed", contactListener);
                }
            } catch (ex) {
                Jx.log.exception("Error removing event listener", ex);
            }
        }
    };

    CommitContact.canCreateContacts = function (account) {
        /// <param name="account" type="Microsoft.WindowsLive.Platform.IAccount"/>
        /// <returns type="Boolean">True if the specified account supports the creation of new contacts</returns>
        Debug.assert(Jx.isObject(account));
        var canCreate = false;

        try {
            var resource = account.getResourceByType(Microsoft.WindowsLive.Platform.ResourceType.contacts);
            if (resource !== null && resource.isEnabled) {
                canCreate = true;
            }
        } catch (ex) {
            Jx.log.exception("Error finding account resource", ex);
        }
        return canCreate;
    };

});
