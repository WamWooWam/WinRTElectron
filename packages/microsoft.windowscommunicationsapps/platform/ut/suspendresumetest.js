
// Copyright (c) Microsoft Corporation. All rights reserved.
//
// Unit tests for SuspendResume functionality

(function() {

    Tx.test("SuspendResumeTest.testApis", function (tc) {
        var platform = PlatformTest.createPlatform(tc);

        var peopleManager = platform.client.peopleManager;
        var eventCount = 0;
        var fired = false;
        var count = 0;

        platform.store.clearTable(Microsoft.WindowsLive.Platform.Test.StoreTableIdentifier.contact);

        function onCollectionChange(ev) {
            fired = true;
            eventCount++;
        }

        var platform2 = PlatformTest.createPlatform(tc);
        var client2 = platform2.client;
        var col2 = platform2.store.getCollection(Microsoft.WindowsLive.Platform.Test.StoreTableIdentifier.contact);
        col2.addEventListener("collectionchanged", onCollectionChange);
        col2.unlock();
        client2.suspend();

        var contact = peopleManager.createContact();
        contact.firstName = "Name1";
        contact.lastName = "Name2";
        contact.commit();

        while (count < 10) {
            count++;
            platform.runMessagePump(50);
        }

        // there shouldn't be an event in suspended state
        tc.isTrue(eventCount == 0);

        client2.resume();

        while (!fired && count < 100) {
            count++;
            platform.runMessagePump(50);
        }

        tc.isTrue(fired, "event not fired");

        col2.dispose();
        platform2.dispose();
    });
})();
