
// Copyright (c) Microsoft Corporation. All rights reserved.
//
// Unit tests for IObject deleted event and getKeepAlive method

(function() {

    Tx.asyncTest("ObjectLifetimeTest.testDeletedEvent", function (tc) {
        var platform = PlatformTest.createPlatform(tc);

        var peopleManager = platform.client.peopleManager;

        var contact = peopleManager.createContact();
        contact.firstName = "Name1";
        contact.lastName = "Name2";
        contact.commit();

        function onObjectDeleted(ev) {
            contact.removeEventListener("deleted", onObjectDeleted);
            tc.start();
        }

        contact.addEventListener("deleted", onObjectDeleted);

        tc.stop();
        platform.store.clearTable(Microsoft.WindowsLive.Platform.Test.StoreTableIdentifier.contact);
    });

    Tx.test("ObjectLifetimeTest.testGetKeepAlive", function (tc) {
        var platform = PlatformTest.createPlatform(tc);

        var peopleManager = platform.client.peopleManager;

        var contact = peopleManager.createContact();
        contact.firstName = "Name1GKA";
        contact.lastName = "Name2GKA";
        contact.commit();

        // Get a noop keep alive, make sure it points to the object
        var keepAlive = contact.getKeepAlive();
        tc.isNotNull(keepAlive, "Did not get a keep alive");
        tc.areEqual(keepAlive.objectId, contact.objectId, "ObjectIds are different");

        // Dispose should be a no-op
        keepAlive.dispose();
        var loadedContact = peopleManager.loadContact(contact.objectId);
        tc.isNotNull(loadedContact, "Contact should not have been deleted from noop keep alive");
    });
})();
