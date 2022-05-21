
// Copyright (c) Microsoft Corporation. All rights reserved.
//
// Unit tests for Set Tile functionality

(function() {

    var wl = Microsoft.WindowsLive.Platform;
    var wlt = wl.Test;
 

    // Set a usertile on a contact.
    Tx.asyncTest("SetTileTest.setTile", { timeoutMs: 2000 }, function (tc) {
        var platform = PlatformTest.createPlatform(tc);

        platform.store.clearTable(wlt.StoreTableIdentifier.contact);
        platform.store.clearTable(wlt.StoreTableIdentifier.person);

        var person = platform.store.createTableEntry(wlt.StoreTableIdentifier.person);
        person.calculatedUIName = "Person1";
        person.commit();

        var existingPerson = platform.client.peopleManager.loadPerson(person.objectId);
        tc.isNotNull(existingPerson, "person not found");

        var contact = platform.store.createTableEntry(wlt.StoreTableIdentifier.contact);
        contact.firstName = "Contact1";
        contact.sourceId = "ABCH";
        platform.store.createRelationship(contact, person, wlt.STOREPROPERTYID.idPropertyPersonStoreId);
        platform.store.createRelationship(contact, platform.client.accountManager.defaultAccount, wlt.STOREPROPERTYID.idPropertyAccountStoreId);
        contact.commit();

        var existingContact = platform.client.peopleManager.loadContact(contact.objectId);
        tc.isNotNull(existingContact, "contact not found");

        tc.isFalse(existingPerson.canClearPersonTile, "should not be able to clear usertile before tile is set.");

        tc.stop();

        Windows.ApplicationModel.Package.current.installedLocation.getFileAsync("Tx\\img\\Tx150x150.png")
                .then(function (file) { 
                    return file.openAsync(Windows.Storage.FileAccessMode.read); 
                })
                .then(function (stream) {
                    existingPerson.setPersonTile(stream);
                    var usertile = existingContact.getUserTile(wl.UserTileSize.extraLarge, false);
                    tc.isNotNull(usertile.appdataURI, "tile path should be non-null after set");
                    tc.isTrue(existingPerson.canClearPersonTile, "should be able to clear tile after set");
                })
                .done(function (success) {
                    tc.start();
                },
                function (failure) {
                    tc.error(failure);
                    tc.start();
                });
            });

})();

