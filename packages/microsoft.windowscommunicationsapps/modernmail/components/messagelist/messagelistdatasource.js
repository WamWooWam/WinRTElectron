
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="MessageList.ref.js" />

Jx.delayDefine(Mail, "MessageListDataSource", function () {
    "use strict";

    Mail.MessageListDataSource = /* @constructor*/function (collection) {
        /// <param name="collection" type="Mail.MessageListCollection"/>
        this._collection = collection;
    };

    Mail.MessageListDataSource.prototype.dispose = function () {
        this._collection = null;
    };

    Mail.MessageListDataSource.prototype._fetchData = function (index, countBefore, countAfter) {
        /// <param name="index" type="Number">the requested index</param>
        /// <param name="countBefore" type="Number">amount of data requested before the index</param>
        /// <param name="countAfter" type="Number">amount of data requested after the index</param>

        Mail.log("MessageListDataSource_fetchData", Mail.LogEvent.start);
        var results = [];
        var start = Math.max(0, index - countBefore);
        var end = Math.min(this._collection.count, index + countAfter + 1);
        for (var ii = start; ii < end; ii++) {
            var message = /*@static_cast(Microsoft.WindowsLive.Platform.IObject)*/this._collection.item(ii);
            results.push({
                key: message.objectId,
                data: message
            });
        }
        var offset = index - start;

        Mail.log("MessageListDataSource_fetchData", Mail.LogEvent.stop);

        
        var objectIds = { };
        for (var i = 0, max = results.length; i < max; i++) {
            var key = results[i].key,
                duplicateIndex = objectIds[key];
            Debug.assert(Jx.isNullOrUndefined(duplicateIndex), "Key = " + key + " at index " + /*@static_cast(String)*/i + " is duplicated with index " + duplicateIndex + " (WindowsBlue 46894). This may result in undefined behavior in ListView.");
            objectIds[key] = i;
        }
        

        return {
            results: results,
            offset: offset
        };
    };

    // The listview can only render about 27890 items (based on our current
    // item size) before they hit the limit of scroll position.
    // So we're going to tell them that we never have more than 27000 items.
    Mail.MessageListDataSource.maxCount = 27000;
    Mail.MessageListDataSource.prototype.itemsFromIndex = function (index, countBefore, countAfter) {
        /// <param name="index" type="Number">the requested index</param>
        /// <param name="countBefore" type="Number">amount of data requested before the index</param>
        /// <param name="countAfter" type="Number">amount of data requested after the index</param>
        Mail.log("MessageListDataSource_itemsFromIndex", Mail.LogEvent.start);
        Debug.assert(Jx.isValidNumber(index) && (index >= 0), "itemsFromIndex is called with index=" + String(index));
        Debug.assert(Jx.isValidNumber(countBefore) && (countBefore >= 0), "itemsFromIndex is called with countBefore=" + String(countBefore));
        Debug.assert(Jx.isValidNumber(countAfter) && (countAfter >= 0), "itemsFromIndex is called with countAfter=" + String(countAfter));

        var result = null;
        var count = Math.min(this._collection.count, Mail.MessageListDataSource.maxCount);
        if (index >= count) {
            // Every time when we create an error object, our Debug Hook will actually intercept it, thus
            // we should only create an error object in case of real errors
            result = WinJS.Promise.wrapError(new WinJS.ErrorFromName(WinJS.UI.FetchError.doesNotExist));
        } else {
            var dataRecords = this._fetchData(index, countBefore, countAfter);
            result = WinJS.Promise.wrap({
                items: dataRecords.results,
                offset: dataRecords.offset,
                totalCount: count,
                absoluteIndex: index
            });
        }
        Mail.log("MessageListDataSource_itemsFromIndex", Mail.LogEvent.stop);
        return result;
    };

    Mail.MessageListDataSource.prototype.getCount = function () {
        Mail.log("MessageListDataSource_count", Mail.LogEvent.start);
        var result = WinJS.Promise.wrap(this._collection.count);
        Mail.log("MessageListDataSource_count", Mail.LogEvent.stop);
        return result;
    };
});

