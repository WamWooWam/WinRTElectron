
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//
//

(function () {

    var P = Microsoft.WindowsLive.Platform;
    var MP = Mocks.Microsoft.WindowsLive.Platform;

    function createItem(id) {
        var item = new MP.Object("Object");
        item.mock$setProperty("objectId", id);
        return item;
    }

    Tx.test("ItemDemux.changes", function (tc) {
        // Start with some items in the collection
        var red = createItem("red");
        var green = createItem("green");
        var collection = new MP.Collection("Object", { clone: function (obj) { return obj; } });
        collection.mock$addItem(red, 0);
        collection.mock$addItem(green, 0);

        var changes = [];
        var hook = Mail.ItemDemux.createHook(collection, changes.unshift, changes);

        // Should be notified when either item changes
        red.mock$setProperty("canDelete", false);
        tc.areEqual(changes.length, 1);
        tc.areEqual(changes[0].collection, collection);
        tc.areEqual(changes[0].item, red);

        green.mock$setProperty("canEdit", false);
        tc.areEqual(changes.length, 2);
        tc.areEqual(changes[0].collection, collection);
        tc.areEqual(changes[0].item, green);

        // Add a new item to the collection, no events should be fired by the demux
        var blue = createItem("blue");
        collection.mock$addItem(blue, 1);
        tc.areEqual(changes.length, 2);

        // Change the newly added item
        blue.mock$setProperty("canEdit", false);
        tc.areEqual(changes.length, 3);
        tc.areEqual(changes[0].item, blue);

        // Change one of the other items
        red.mock$setProperty("canDelete", true);
        tc.areEqual(changes.length, 4);
        tc.areEqual(changes[0].item, red);

        // Move an item, no events should fire
        collection.mock$moveItem(0, 2)
        tc.areEqual(changes.length, 4);

        // Change the moved item
        green.mock$setProperty("canEdit", true);
        tc.areEqual(changes.length, 5);
        tc.areEqual(changes[0].item, green);

        // Remove an item, no events should fire
        collection.mock$removeItemById("red")
        tc.areEqual(changes.length, 5);

        // Change the removed item, no events should fire
        red.mock$setProperty("canEdit", false);
        tc.areEqual(changes.length, 5);

        // Change one of the remaining items
        blue.mock$setProperty("canEdit", true);
        tc.areEqual(changes.length, 6);
        tc.areEqual(changes[0].item, blue);

        // Dispose the demux, no events should fire anymore
        hook.dispose();
        tc.areEqual(changes.length, 6);

        blue.mock$setProperty("canDelete", false);
        tc.areEqual(changes.length, 6);
        green.mock$setProperty("canEdit", false);
        tc.areEqual(changes.length, 6);
    });

    Tx.test("ItemDemux.reset", function (tc) {
        var red = createItem("red");
        var green = createItem("green");
        var blue = createItem("blue");

        var collection = new MP.Collection("Object", { clone: function (obj) { return obj; } });
        collection.mock$addItem(red, 0);
        collection.mock$addItem(green, 0);
        collection.mock$addItem(blue, 0);

        var changes = [];
        var hook = Mail.ItemDemux.createHook(collection, changes.unshift, changes);
        tc.areEqual(changes.length, 0);

        // Suspend notifications and make changes to force a reset
        collection.mock$suspendNotifications();
        collection.mock$removeItemById("blue");
        tc.areEqual(changes.length, 0);

        collection.mock$moveItem(0, 1);
        tc.areEqual(changes.length, 0);

        var yellow = createItem("yellow");
        collection.mock$addItem(yellow, 1);
        tc.areEqual(changes.length, 0);

        // Reset the collection
        collection.mock$resumeNotifications();
        tc.areEqual(changes.length, 0);

        // Should be notified when remaining items change
        red.mock$setProperty("canDelete", false);
        tc.areEqual(changes.length, 1);
        tc.areEqual(changes[0].item, red);

        green.mock$setProperty("canEdit", false);
        tc.areEqual(changes.length, 2);
        tc.areEqual(changes[0].item, green);

        // Should be notified when the new item changes
        yellow.mock$setProperty("canEdit", false);
        tc.areEqual(changes.length, 3);
        tc.areEqual(changes[0].item, yellow);

        // Shouldn't be notified when the removed item changes
        blue.mock$setProperty("canEdit", false);
        tc.areEqual(changes.length, 3);

        hook.dispose();
        tc.areEqual(changes.length, 3);
    });

})();

