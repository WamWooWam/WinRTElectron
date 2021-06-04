/// <reference path='//Microsoft.WinJS.1.0/js/base.js' />
/// <reference path='//Microsoft.WinJS.1.0/js/ui.js' />
/// <reference path='../../common/js/tracing.js' />
/// <reference path='../../common/js/errors.js' />
/// <reference path='../../common/js/utilities.js' />
(function () {
    "use strict";

    var getAllItems = function (dataProvider, options) {
        /// <summary>
        /// Retrieves all items from given provider.
        /// </summary>
        /// <param name="dataProvider">
        /// Data provider that can be queried for data items.
        /// </param>
        /// <param name="options" optional="true">
        /// Optional object which allows for specializing the behavior of this method.
        /// The object can contain any of the following properties:
        ///     {
        ///         from: /*index of the first item that will be retrieved; 
        ///                 if omitted then it is zero*/,
        ///         count: /*max number of items that will be returned; 
        ///                 if omitted then there is no limit*/
        ///         processItem: /*callback function that will be called on each item returned 
        ///                         by data provider; item is specified as function parameter*/
        ///     }
        /// </param>
        /// <returns type="WinJS.Promise">
        /// A promise which completes when all items have been retrieved.
        /// </returns>
        if (!dataProvider) {
            throw new BingApp.Classes.ErrorArgumentNullOrUndefined("dataProvider");
        }

        var providerIdentity = dataProvider.getIdentity();

        var maxCount;
        var processItem;
        var initialIndex = 0;
        if (options) {
            maxCount = options.count;
            processItem = options.processItem;
            if (options.from) {
                initialIndex = options.from;
            }
        }

        var hasLimit = !!maxCount;

        var allItems = [];

        // First, determine if provider has any items and only then initiate the process of 
        // collecting items. Note that returned number of items is not necessarily the final count.
        // Data provider may return new total count upon each call to its .getItems() method.
        var getCount = dataProvider.getCount || function () { return WinJS.Promise.as(WinJS.UI.CountResult.unknown); };
        return dataProvider.getCount().then(function (initialCount) {
            if (initialCount === WinJS.UI.CountResult.unknown || initialCount === WinJS.UI.CountError.noResponse) {
                initialCount = Infinity;
            }

            BingApp.traceVerbose(
                "BingApp.Data.getAllItems: data provider '{0}' returned '{1}' as its initial count for items.",
                providerIdentity,
                initialCount);

            var from = initialIndex;

            if (initialCount <= from) {
                BingApp.traceWarning(
                    "BingApp.Data.getAllItems: returning empty array of items because specified initial index {0} is larger than or equal to the number of items {1} that can be returned by data provider '{2}'",
                    from,
                    initialCount,
                    providerIdentity);

                return allItems;
            }

            var totalCount = initialCount;
            var nextBatchSize = hasLimit ? Math.min(maxCount, initialCount) : initialCount;

            // Collect all items in batches and check if all items are collected upon completion 
            // of each iteration.
            var collectItems = function (promise) {
                return promise.then(function (result) {
                    // Check if data provider can fetch any items
                    if (!result.items) {
                        BingApp.traceWarning(
                            "BingApp.Data.getAllItems: data provider '{0}' did not return any items in the result object; function will abort and will return items that has been collected so far (count={1}).",
                            providerIdentity,
                            allItems.length);

                        return allItems;
                    } else {
                        BingApp.traceVerbose(
                            "BingApp.Data.getAllItems: data provider '{0}' returned {1} items on current iteration.",
                            providerIdentity,
                            result.items.length);
                    }

                    // Use apply to push all returned items into allItems array
                    allItems.push.apply(allItems, result.items);

                    // Update totalCount only if provider returned new value for it as part of processing 
                    // .getItems() request.
                    if (!!result.totalCount) {
                        BingApp.traceVerbose(
                            "BingApp.Data.getAllItems: data provider '{0}' indicated new total count value: {1}.",
                            providerIdentity,
                            result.totalCount);

                        totalCount = result.totalCount;
                    }

                    // Check if desired number of items was already retrieved
                    nextBatchSize = (hasLimit ? Math.min(maxCount, totalCount) : totalCount) - allItems.length;
                    if (nextBatchSize <= 0) {
                        BingApp.traceVerbose(
                            "BingApp.Data.getAllItems: data provider '{0}' completed fetching items; overall number of returned items is {1}.",
                            providerIdentity,
                            allItems.length);
                        return allItems;
                    } else {
                        // Make recursive call if next batch of items have to be retrieved
                        from = initialIndex + allItems.length;
                        return collectItems(getItemsInternal(dataProvider, from, nextBatchSize, processItem));
                    }
                });
            }

            return collectItems(getItemsInternal(dataProvider, from, nextBatchSize, processItem));
        });
    };

    var getItemsInternal = function (dataProvider, from, count, processItem) {
        /// <summary>
        /// Helper method to retrieve batch of items from given provider.
        /// </summary>
        /// <param name="dataProvider">
        /// Data provider that can be queried for data items.
        /// </param>
        /// <param name="from" type="number">
        /// The index of the first item that has to be returned.
        /// </param>
        /// <param name="count" type="number">
        /// The number of items to be returned.
        /// </param>
        /// <param name="processItem" type="function">
        /// Callback method to be called on each item fetched by data provider.
        /// </param>
        /// <returns type="WinJS.Promise">
        /// A promise which when completed returns an object in the following format:
        ///     {
        ///         items: /*array of returned items*/,
        ///         totalCount: /*total number of items that can be returned by data provider*/
        ///     }
        /// </returns>
        BingApp.traceVerbose(
            "BingApp.Data.getAllItems: asking data provider '{0}' to fetch {1} items starting from index {2}",
            dataProvider.getIdentity(),
            count,
            from);

        return dataProvider.getItems(from, count, processItem);
    };

    // Expose utility functions via application namespace
    WinJS.Namespace.define("BingApp.Data", {
        getAllItems: getAllItems,
    });
})();
