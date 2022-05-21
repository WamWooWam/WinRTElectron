
// Copyright (C) Microsoft Corporation.  All rights reserved.

/*global Tx,People,Include,Mocks*/

Include.initializeFileScope(function () {

    var P = People;
    var M = Mocks;

    Tx.test("platformBinderTests.testBinder", function (tc) {

        var calls = new M.CallVerifier(tc);
        var callbacks = {};
        calls.initialize(callbacks, [ 
            "calculatedUIName",
            "calculatedUIName2",
            "mostRelevantEmail",
            "linkedContacts",
            "contact1FirstName",
            "contact2FirstName",
            "contact1HomeLocation",
            "contact2HomeLocation",
            "contact1Account",
            "contact2Account"
        ]);
        var prov = new Mocks.Microsoft.WindowsLive.Platform.Data.JsonProvider();
        var account1 = prov.loadObject("Account", {
            displayName: "displayName1"
        });
        var account2 = prov.loadObject("Account", {
            displayName: "displayName2"
        });
        var contact1 = prov.loadObject("Contact", {
            firstName: "firstName1",
            homeLocation: {
                city: "city1",
                state: "state1"
            },
            account: account1
        });
        var contact2 = prov.loadObject("Contact", {
            firstName: "firstName2",
            homeLocation: {
                street: "street1",
                country: "country1"
            },
            account: account2
        });
        var person = prov.loadObject("Person", {
            calculatedUIName: "name1",
            mostRelevantEmail: "email1",
            linkedContacts: [ contact1.objectId, contact2.objectId ]
        });
        var binder = new P.PlatformObjectBinder(person);
        tc.areEqual(binder.getPlatformObject(), person);

        var callback = callbacks.calculatedUIName.bind(callbacks);
        var value = binder.getValue(callback, "calculatedUIName");
        tc.areEqual("name1", value);
        value = binder.getValue(callback, "calculatedUIName");
        tc.areEqual("name1", value);
        value = binder.getValue(callbacks.calculatedUIName2.bind(callbacks), "calculatedUIName");
        tc.areEqual("name1", value);

        value = binder.getValue(null, "mostRelevantEmail");
        tc.areEqual("email1", value);

        var linkedContacts = binder.getCollection(callbacks.linkedContacts.bind(callbacks), "linkedContacts");
        tc.areEqual(linkedContacts.length, 2);
        tc.areEqual(linkedContacts[0].getPlatformObject(), person.linkedContacts.item(0));
        tc.areEqual(linkedContacts[1].getPlatformObject(), person.linkedContacts.item(1));

        value = linkedContacts[0].getValue(callbacks.contact1FirstName.bind(callbacks), "firstName");
        tc.areEqual("firstName1", value);
        value = linkedContacts[1].getValue(callbacks.contact2FirstName.bind(callbacks), "firstName");
        tc.areEqual("firstName2", value);

        value = linkedContacts[0].getValue(callbacks.contact1HomeLocation.bind(callbacks), "homeLocation");
        tc.areEqual("city1", value.city);
        tc.areEqual("state1", value.state);
        value = linkedContacts[1].getValue(callbacks.contact2HomeLocation.bind(callbacks), "homeLocation");
        tc.areEqual("street1", value.street);
        tc.areEqual("country1", value.country);

        var accountA = linkedContacts[0].getObject(callbacks.contact1Account.bind(callbacks), "account");
        tc.areEqual(accountA.getPlatformObject(), account1);
        var accountB = linkedContacts[1].getObject(callbacks.contact2Account.bind(callbacks), "account");
        tc.areEqual(accountB.getPlatformObject(), account2);

        // Subscribed property update, multiple listeners
        calls.expectOnce(callbacks, "calculatedUIName");
        calls.expectOnce(callbacks, "calculatedUIName2");
        person.mock$setProperty("calculatedUIName", "name2");
        calls.verify();
        tc.areEqual("name2", binder.getValue(null, "calculatedUIName"));

        // Unsubscribed property update
        person.mock$setProperty("mostRelevantEmail", "email2");
        calls.verify();
        tc.areEqual("email2", binder.getValue(null, "mostRelevantEmail"));

        // Object update
        calls.expectOnce(callbacks, "contact1Account");
        contact1.mock$setProperty("account", account2);
        calls.verify();
        tc.areEqual(account2, linkedContacts[1].getObject(null, "account").getPlatformObject());

        // Propert update on sub-object
        calls.expectOnce(callbacks, "contact2FirstName");
        contact2.mock$setProperty("firstName", "firstName3");
        calls.verify();
        tc.areEqual("firstName3", linkedContacts[1].getValue(null, "firstName"));

        // Structure update
        calls.expectOnce(callbacks, "contact1HomeLocation");
        contact1.mock$setProperty("homeLocation", { street: "street2" });
        calls.verify();
        value = linkedContacts[0].getValue(null, "homeLocation");
        tc.areEqual("street2", value.street);
        tc.areEqual("city1", value.city);
        tc.areEqual("state1", value.state);

        // Collection change: remove item
        calls.expectOnce(callbacks, "linkedContacts");
        person.linkedContacts.mock$removeItem(0);
        calls.verify();
        linkedContacts = binder.getCollection(null, "linkedContacts");
        tc.areEqual(1, linkedContacts.length);
        tc.areEqual(contact2, linkedContacts[0].getPlatformObject());

        // Removed items fire no updates
        contact1.mock$setProperty("firstName", "firstName4");
        calls.verify();

        // Collection change: add item
        calls.expectOnce(callbacks, "linkedContacts");
        person.linkedContacts.mock$addItem(contact1, 1);
        calls.verify();
        linkedContacts = binder.getCollection(null, "linkedContacts");
        tc.areEqual(2, linkedContacts.length);
        tc.areEqual(contact2, linkedContacts[0].getPlatformObject());
        tc.areEqual(contact1, linkedContacts[1].getPlatformObject());

        // Collection change: move item
        calls.expectOnce(callbacks, "linkedContacts");
        person.linkedContacts.mock$moveItem(1, 0);
        calls.verify();
        linkedContacts = binder.getCollection(null, "linkedContacts");
        tc.areEqual(2, linkedContacts.length);
        tc.areEqual(contact1, linkedContacts[0].getPlatformObject());
        tc.areEqual(contact2, linkedContacts[1].getPlatformObject());

        // Updates still fired after move
        calls.expectOnce(callbacks, "contact2FirstName");
        contact2.mock$setProperty("firstName", "firstName5");
        calls.verify();
        tc.areEqual("firstName5", linkedContacts[1].getValue(null, "firstName"));

        // Collection change: reset
        person.linkedContacts.mock$suspendNotifications();
        person.linkedContacts.mock$removeItem(1);
        calls.verify();
        calls.expectOnce(callbacks, "linkedContacts");
        person.linkedContacts.mock$resumeNotifications();
        calls.verify();
        linkedContacts = binder.getCollection(null, "linkedContacts");
        tc.areEqual(1, linkedContacts.length);
        tc.areEqual(contact1, linkedContacts[0].getPlatformObject());

        binder.dispose();
    });

    Tx.test("platformBinderTests.testAccessor", function (tc) {

        var calls = new M.CallVerifier(tc);
        var callbacks = {};
        calls.initialize(callbacks, [ 
            "accessor1",
            "accessor2"
        ]);

        var prov = new Mocks.Microsoft.WindowsLive.Platform.Data.JsonProvider();
        var account1 = prov.loadObject("Account", {
            displayName: "displayName1"
        });
        var account2 = prov.loadObject("Account", {
            displayName: "displayName2"
        });
        var contact1 = prov.loadObject("Contact", {
            account: account1
        });
        var contact2 = prov.loadObject("Contact", {
            account: account2
        });
        var person = prov.loadObject("Person", {
            firstName: "name1",
            linkedContacts: [ contact1.objectId, contact2.objectId ]
        });

        var binder = new P.PlatformObjectBinder(person);
        var accessor1 = binder.createAccessor(callbacks.accessor1.bind(callbacks));
        var accessor2 = binder.createAccessor(callbacks.accessor2.bind(callbacks));

        var verifyAccessor1 = function (expected) {
            tc.areEqual(
                expected,
                accessor1.firstName + ": " + accessor1.linkedContacts.map(function (contact) { return contact.account.displayName; }).join(", ")
            );
        };
        verifyAccessor1("name1: displayName1, displayName2");
        tc.areEqual("name1", accessor2.firstName);

        calls.expectOnce(callbacks, "accessor1");
        account1.mock$setProperty("displayName", "displayName3");
        calls.verify();
        verifyAccessor1("name1: displayName3, displayName2");

        calls.expectOnce(callbacks, "accessor1");
        person.linkedContacts.mock$removeItem(1);
        calls.verify();
        verifyAccessor1("name1: displayName3");

        calls.expectOnce(callbacks, "accessor1");
        calls.expectOnce(callbacks, "accessor2");
        person.mock$setProperty("firstName", "name2");
        verifyAccessor1("name2: displayName3");
        tc.areEqual("name2", accessor2.firstName);

        calls.expectOnce(callbacks, "accessor1");
        contact1.mock$setProperty("account", null);
        calls.verify();
        tc.areEqual(null, accessor1.linkedContacts[0].account);

        binder.dispose();

        person.mock$setProperty("firstName", "name3");
        calls.verify();
    });
});