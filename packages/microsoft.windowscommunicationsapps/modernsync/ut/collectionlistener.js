
CollectionListener = /*@constructor*/function(collection)
{
    var updateCount = 0;
    var expectedUpdates = 0;
    var notificationType = Microsoft.WindowsLive.Platform.CollectionChangeType.itemAdded;

    this.dispose = function()
    {
        getCollection().removeEventListener("collectionchanged", onCollectionChange);
    }

    this.waitForCollectionChanged = function(platform, action,  type, numExpectedChanges)
    {
        if (typeof (numExpectedChanges) == "undefined")
        {
            numExpectedChanges = 1;
        }
        notificationType = type;
        resetUpdateCount();
        action();
        runMessagePump(platform, numExpectedChanges);
        return getUpdateCount() == numExpectedChanges;
    };

    this.setExpectedUpdates = function(numExpectedChanges)
    {
        expectedUpdates = numExpectedChanges;
    };

    this.unlockCollectionAndWaitForCollectionChanged = function(platform, type, numExpectedChanges)
    {
        if (typeof (numExpectedChanges) == "undefined")
        {
            numExpectedChanges = 1;
        }
        notificationType = type;
        resetUpdateCount();
        getCollection().unlock();
        runMessagePump(platform, numExpectedChanges);
        return getUpdateCount() == numExpectedChanges;
    };


    var getUpdateCount = function()
    {
        return updateCount;
    };

    var resetUpdateCount = function()
    {
        updateCount = 0;
    };

    var onCollectionChange = function(evt)
    {
        var eventType = evt.detail[0].eType;

        // Batch notifications don't count
        if (eventType === Microsoft.WindowsLive.Platform.CollectionChangeType.itemRemoved ||
            eventType === Microsoft.WindowsLive.Platform.CollectionChangeType.itemChanged ||
            eventType === Microsoft.WindowsLive.Platform.CollectionChangeType.itemAdded) {

            if (eventType == notificationType) {
                updateCount++;
            }
        }
    };

    var runMessagePump = function(platform, numExpectedChanges)
    {
        var count = 0;
        var maxCount = 100;
        while (getUpdateCount() < numExpectedChanges && count < maxCount)
        {
            count++;
            platform.runMessagePump(100);
        }

        return count;
    }

    var getCollection = function()
    {
        return collection;
    };

    collection.addEventListener("collectionchanged", onCollectionChange);
    return this;
};
