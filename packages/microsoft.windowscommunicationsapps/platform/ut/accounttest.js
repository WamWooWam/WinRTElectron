
// Copyright (c) Microsoft Corporation. All rights reserved.
//
// Unit tests for Account functionality

/*global Microsoft,Tx,PlatformTest*/

(function() {

    var wl = Microsoft.WindowsLive.Platform,
        wlt = wl.Test;

    // Create a contact with sourceId and network with the same sourceID
    // Verify network properties
    Tx.test("AccountTest.testContactGetFullNetwork", function (tc) {
        var platform = PlatformTest.createPlatform(tc);

        platform.store.clearTable(wlt.StoreTableIdentifier.account);
        platform.store.clearTable(wlt.StoreTableIdentifier.contact);

        var networkOne = platform.store.createTableEntry(wlt.StoreTableIdentifier.account);
        networkOne.accountState = 3;
        networkOne.accountType = 4;
        networkOne.createDate = new Date(2000, 1, 1);
        networkOne.sourceId = "TT";
        networkOne.serviceState = 4;
        networkOne.serviceName = "TestNetwork";
        networkOne.hasServicePartner = true;
        networkOne.offers = 1;
        networkOne.offersCalculated = 1;
        networkOne.offersSupported = 1;
        networkOne.lastSyncTimeStamp = new Date(2000, 1, 1);
        networkOne.lastUserEditTimeStamp = new Date(2000, 1, 3);
        networkOne.commit();

        var contact = platform.store.createTableEntry(wlt.StoreTableIdentifier.contact);
        contact.firstName = "Contact1";
        contact.sourceId = "TT";
        platform.store.createRelationship(contact, networkOne, wlt.STOREPROPERTYID.idPropertySourceAccountId);
        contact.commit();

        var existingContact = platform.client.peopleManager.loadContact(contact.objectId);
        tc.isNotNull(existingContact, "populated contact not found");

        var network = existingContact.account;
        tc.isNotNull(network, "network cannot be found");
        tc.areEqual(network.sourceId, "TT", "wrong sourceId");
        tc.areEqual(network.serviceName, "\u202aTestNetwork\u202c", "wrong serviceName");
    });

    Tx.test("AccountTest.testContactGetPartialNetwork", function (tc) {
        var platform = PlatformTest.createPlatform(tc);

        platform.store.clearTable(wlt.StoreTableIdentifier.account);
        platform.store.clearTable(wlt.StoreTableIdentifier.contact);

        var networkOne = platform.store.createTableEntry(wlt.StoreTableIdentifier.account);
        networkOne.accountState = 3;
        networkOne.accountType = 4;
        networkOne.createDate = new Date(2000, 1, 1);
        networkOne.sourceId = "TT";
        networkOne.offersSupported = 1;
        networkOne.privateMessageUrl= "http://TT/verb1={0}";
        networkOne.profileUrl = "http://TT/verb2={0}/test?{0}";
        networkOne.reportAbuseUrl = "http://TT/verb3={0}/test?{0}/something";
        networkOne.commit();

        var contactOne = platform.store.createTableEntry(wlt.StoreTableIdentifier.contact);
        contactOne.firstName = "Contact1";
        contactOne.sourceId = "TT";
        contactOne.sourceObjectId = "12345";
        platform.store.createRelationship(contactOne, networkOne, wlt.STOREPROPERTYID.idPropertySourceAccountId);
        contactOne.commit();

        var contact = platform.client.peopleManager.loadContact(contactOne.objectId);
        tc.isNotNull(contact, "populated contact not found");

        var network = contact.account;
        tc.isNotNull(network, "network cannot be found");
        tc.areEqual(network.sourceId, "TT", "wrong sourceId");
        tc.areEqual(network.serviceName, "", "wrong serviceName");
    });

    Tx.test("AccountTest.testNetworkUpdate", function (tc) {
        var platform = PlatformTest.createPlatform(tc);

        var fired = false;
        var count = 0;

        platform.store.clearTable(wlt.StoreTableIdentifier.account);
        platform.store.clearTable(wlt.StoreTableIdentifier.contact);

        function onObjectChange() {
            fired = true;
        }

        var networkOne = platform.store.createTableEntry(wlt.StoreTableIdentifier.account);
        networkOne.accountState = 3;
        networkOne.accountType = 4;
        networkOne.createDate = new Date(2000, 1, 1);
        networkOne.sourceId = "TT";
        networkOne.offersSupported = 1;
        networkOne.privateMessageUrl = "http://TT/verb1={0}";
        networkOne.profileUrl = "http://TT/verb2={0}/test?{0}";
        networkOne.reportAbuseUrl = "http://TT/verb3={0}/test?{0}/something";
        networkOne.commit();

        var contactOne = platform.store.createTableEntry(wlt.StoreTableIdentifier.contact);
        contactOne.firstName = "Contact1";
        contactOne.sourceId = "TT";
        contactOne.sourceObjectId = "12345";
        platform.store.createRelationship(contactOne, networkOne, wlt.STOREPROPERTYID.idPropertySourceAccountId);
        contactOne.commit();

        var contact = platform.client.peopleManager.loadContact(contactOne.objectId);
        tc.isNotNull(contact, "populated contact not found");

        var network = contact.account;
        tc.isNotNull(network, "network cannot be found");

        var resource = network.getResourceByType(Microsoft.WindowsLive.Platform.ResourceType.contactAgg);
        tc.isNotNull(resource, "contactAgg resource not found");
        tc.isFalse(resource.isEnabled, "wrong doesContactAggregate");

        resource.addEventListener("changed", onObjectChange);

        networkOne.hasServicePartner = true;
        networkOne.serviceState = 2;
        networkOne.offers = 1;
        networkOne.offersCalculated = 1;
        networkOne.commit();

        while (!fired && count < 100) {
            count++;
            platform.runMessagePump(50);
        }

        resource.removeEventListener("changed", onObjectChange);

        tc.isTrue(fired, "event did not fire");
        tc.isTrue(resource.isEnabled, "wrong doesContactAggregate");
    });

    Tx.test("AccountTest.testVerbsWithThirdPartyContact", function (tc) {
        var platform = PlatformTest.createPlatform(tc);

        platform.store.clearTable(wlt.StoreTableIdentifier.account);
        platform.store.clearTable(wlt.StoreTableIdentifier.contact);

        var networkOne = platform.store.createTableEntry(wlt.StoreTableIdentifier.account);
        networkOne.accountState = 3;
        networkOne.accountType = 4;
        networkOne.createDate = new Date(2000, 1, 1);
        networkOne.sourceId = "TT";
        networkOne.offersSupported = 1;
        networkOne.privateMessageUrl = "http://TT/verb1={0}";
        networkOne.profileUrl = "http://TT/verb2={0}/test?{0}";
        networkOne.reportAbuseUrl = "http://TT/verb3={0}/test?{0}/something";
        networkOne.commit();

        var contactOne = platform.store.createTableEntry(wlt.StoreTableIdentifier.contact);
        contactOne.firstName = "Contact1";
        contactOne.sourceId = "TT";
        contactOne.sourceObjectId = "12345";
        platform.store.createRelationship(contactOne, networkOne, wlt.STOREPROPERTYID.idPropertySourceAccountId);
        contactOne.commit();

        var contact = platform.client.peopleManager.loadContact(contactOne.objectId);
        tc.isNotNull(contact, "populated contact not found");

        var verbs = contact.verbs;
        tc.isNotNull(verbs, "verbs cannot be found");
        tc.areEqual(verbs.count, 3, "wrong count for verbs");
    
        var verb1 = verbs.item(0);
        tc.areEqual(verb1.verbType, wl.VerbType.privateMessage, "wrong verb type 1");
        tc.areEqual(verb1.url, "http://TT/verb1=12345", "wrong url 1");
    
        var verb2 = verbs.item(1);
        tc.areEqual(verb2.verbType, wl.VerbType.profile, "wrong verb type 2");
        tc.areEqual(verb2.url, "http://TT/verb2=12345/test?12345", "wrong url 2");
    
        var verb3 = verbs.item(2);
        tc.areEqual(verb3.verbType, wl.VerbType.reportAbuse, "wrong verb type 3");
        tc.areEqual(verb3.url, "http://TT/verb3=12345/test?12345/something", "wrong url 3");    
    
        verbs.dispose();    
    });

    Tx.test("AccountTest.testVerbsWithNormalContact", function (tc) {
        var platform = PlatformTest.createPlatform(tc);

        platform.store.clearTable(wlt.StoreTableIdentifier.account);
        platform.store.clearTable(wlt.StoreTableIdentifier.contact);

        var networkOne = platform.store.createTableEntry(wlt.StoreTableIdentifier.account);
        networkOne.accountState = 3;
        networkOne.accountType = 4;
        networkOne.createDate = new Date(2000, 1, 1);
        networkOne.sourceId = "TT";
        networkOne.offersSupported = 1;
        networkOne.privateMessageUrl = "http://TT/verb1={0}";
        networkOne.profileUrl = "http://TT/verb2={0}/test?{0}";
        networkOne.commit();

        var contactOne = platform.store.createTableEntry(wlt.StoreTableIdentifier.contact);
        contactOne.firstName = "Contact1";
        contactOne.sourceId = "TT";
        platform.store.createRelationship(contactOne, networkOne, wlt.STOREPROPERTYID.idPropertySourceAccountId);
        contactOne.commit();

        var contact = platform.client.peopleManager.loadContact(contactOne.objectId);
        tc.isNotNull(contact, "populated contact not found");

        var verbs = contact.verbs;
        tc.isNull(verbs, "verbs should not be found");

    });

    Tx.test("AccountTest.testChangedEvent", function (tc) {
        var platform = PlatformTest.createPlatform(tc);

        var fired = false;
        var count = 0;

        platform.store.clearTable(wlt.StoreTableIdentifier.account);
        platform.store.clearTable(wlt.StoreTableIdentifier.contact);

        function onObjectChange() {
            fired = true;
        }

        var networkOne = platform.store.createTableEntry(wlt.StoreTableIdentifier.account);
        networkOne.accountState = 3;
        networkOne.accountType = 4;
        networkOne.createDate = new Date(2000, 1, 1);
        networkOne.sourceId = "TT";
        networkOne.serviceState = 4;
        networkOne.serviceName = "TestNetwork";
        networkOne.hasServicePartner = true;
        networkOne.offers = 1;
        networkOne.offersCalculated = 1;
        networkOne.offersSupported = 1;
        networkOne.lastSyncTimeStamp = new Date(2000, 1, 1);
        networkOne.lastUserEditTimeStamp = new Date(2000, 1, 3);
        networkOne.commit();

        var contactOne = platform.store.createTableEntry(wlt.StoreTableIdentifier.contact);
        contactOne.firstName = "Contact1";
        contactOne.sourceId = "TT";
        platform.store.createRelationship(contactOne, networkOne, wlt.STOREPROPERTYID.idPropertySourceAccountId);
        contactOne.commit();

        var contact = platform.client.peopleManager.loadContact(contactOne.objectId);
        tc.isNotNull(contact, "populated contact not found");

        var network = contact.account;
        tc.isNotNull(network, "network cannot be found");

        if (network.addEventListener)
        {
            network.addEventListener("changed", onObjectChange);
        }
        else
        {
            network["Microsoft.WindowsLive.Platform.IObject.addEventListener"]("changed", onObjectChange);
        }

        networkOne.serviceName = "TestUpdatedName";
        networkOne.commit();

        while (!fired && count < 100) {
            count++;
            platform.runMessagePump(50);
        }

        if (network.removeEventListener)
        {
            network.removeEventListener("changed", onObjectChange);
        }
        else
        {
            network["Microsoft.WindowsLive.Platform.IObject.removeEventListener"]("changed", onObjectChange);
        }

        tc.isTrue(fired, "event did not fire");
        // service name should be 'TestUpdatedName'
        tc.areEqual(network.serviceName, "\u202aTestUpdatedName\u202c", "wrong serviceName");
    });
})();

