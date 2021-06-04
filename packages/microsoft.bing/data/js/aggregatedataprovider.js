/// <reference path="//Microsoft.WinJS.1.0/js/base.js" />
/// <reference path="//Microsoft.WinJS.1.0/js/ui.js" />
/// <reference path="../../common/js/tracing.js" />
/// <reference path="../../common/js/utilities.js" />
/// <reference path="../../common/js/errors.js" />
(function () {
    "use strict";

    /// <summary>
    /// Defines class that implements read-only data provider which aggregates and exposes items 
    /// supplied by set of data providers.
    /// </summary>
    var AggregateDataProvider = WinJS.Class.define(
        function (identity, dataProviders) {
            /// <summary>
            /// Creates an AggregateDataProvider object.
            /// </summary>
            /// <param name="identity" type="String">
            /// String that uniquely identifies this instance. Note that currently we do not have 
            /// any built in mechanism for verifying uniqueness of the identity.
            /// </param>
            /// <param name="dataProviders" type="Array">
            /// Array of data providers that will supply items for aggregation.
            /// </param>
            /// <returns type="BingApp.Classes.AggregateDataProvider">
            /// AggregateDataProvider instance.
            /// </returns>
            if (!(this instanceof BingApp.Classes.AggregateDataProvider)) {
                BingApp.traceWarning("AggregateDataProvider.ctor: Attempted using AggregateDataProvider ctor as function; redirecting to use 'new AggregateDataProvider()'.");
                return new BingApp.Classes.AggregateDataProvider(identity, dataProviders);
            }

            if (!identity) {
                throw new BingApp.Classes.ErrorArgumentNullOrUndefined("identity");
            }

            if (!dataProviders) {
                throw new BingApp.Classes.ErrorArgumentNullOrUndefined("dataProviders");
            }

            Object.defineProperties(this, {
                identity: { value: identity, writable: false, enumerable: false, configurable: false },
                dataProviderDescriptors: { value: [], writable: false, enumerable: false, configurable: false },
                aggregateCount: { writable: true, enumerable: false, configurable: false },
                getCountOperation: { writable: true, enumerable: false, configurable: false },
            });

            var that = this;
            dataProviders.forEach(function (dataProvider) {
                that.dataProviderDescriptors.push({
                    dataProvider: dataProvider
                });
            });
        },
        {
            getIdentity: function () {
                /// <summary>
                /// Gets the string that uniquely identifies this instance of data provider.
                /// </summary>
                /// <returns type="String">
                /// Unique string identifier.
                /// </returns>
                return this.identity;
            },
            getCount: function () {
                /// <summary>
                /// Gets the total number of items that can be returned by data provider.
                /// </summary>
                /// <returns type="WinJS.Promise">
                /// A promise which when completed returns the total number of items that can be 
                /// returned by data provider.
                /// </returns>

                // Check if there is active getCount operation and if so return it
                if (this.getCountOperation) {
                    BingApp.traceInfo("AggregateDataProvider.getCount: method is called while previous getCount operation did not finish yet; returning promise for getCount operation that is already running.");
                    return this.getCountOperation;
                }

                // Check if count was already calculated
                if (!BingApp.Utilities.isNullOrUndefined(this.aggregateCount)) {
                    BingApp.traceInfo("AggregateDataProvider.getCount: method was called before; returning previously calculated count '{0}'.", this.aggregateCount);
                    return WinJS.Promise.as(this.aggregateCount);
                }

                var that = this;
                this.getCountOperation = new WinJS.Promise(
                    function init(complete, error) {
                        var promises = [WinJS.Promise.as(0)];

                        // Query each of data providers and aggregate counts returned by all of them
                        that.dataProviderDescriptors.forEach(function (descriptor) {
                            var providerIdentity = descriptor.dataProvider.getIdentity();

                            // Check if data provider has already been queried for its items count  
                            if (typeof descriptor.count === "number") {
                                BingApp.traceInfo(
                                    "AggregateDataProvider.getCount: reusing previously calculated count '{0}' for aggregated provider with identity '{1}'.",
                                    descriptor.count,
                                    providerIdentity);
                                promises.push(WinJS.Promise.as(descriptor.count));
                            } else {
                                promises.push(descriptor.dataProvider.getCount().then(
                                    function onCompleted(result) {
                                        BingApp.traceInfo(
                                            "AggregateDataProvider.getCount: storing count '{0}' for aggregated provider with identity '{1}'.",
                                            result,
                                            providerIdentity);
                                        descriptor.count = result;
                                        return result;
                                    },
                                    function onError(err) {
                                        BingApp.traceWarning(
                                            "AggregateDataProvider.getCount: error returned while trying to determine items count for aggregated provider with identity '{0}'. Error message: '{1}'",
                                            providerIdentity,
                                            err.message);
                                        delete descriptor.count;
                                        return WinJS.UI.CountError.noResponse;
                                    }));
                            }
                        });

                        // Combine all counts together
                        WinJS.Promise.join(promises).then(
                            function onComplete(results) {
                                var unknownCount = true;
                                var aggregatedCount = 0;
                                results.forEach(function (count) {
                                    if (typeof count === "number") {
                                        unknownCount = false;
                                        aggregatedCount += count;
                                    }
                                });

                                complete(unknownCount ? WinJS.UI.CountResult.unknown : aggregatedCount);
                            },
                            error);
                    });

                // Once count operation is completed we will update the cached value for aggregate count 
                // and reset reference to the operation; this will allow for executing "fresh" count
                // operations
                this.getCountOperation.done(function (result) {
                    BingApp.traceInfo("AggregateDataProvider.getCount: calculated aggregate count is '{0}'.", result);

                    that.aggregateCount = result;

                    that.getCountOperation = null;
                })

                // Note that we need to check if getCountOperation already completed - this will be the case
                // if data providers return count information synchronously.
                return this.getCountOperation ? this.getCountOperation : WinJS.Promise.as(this.aggregateCount);
            },
            getItems: function (from, count, processItem) {
                /// <summary>
                /// Gets the items within given range.
                /// </summary>
                /// <param name="from" type="number">
                /// The index of the first item that has to be returned.
                /// </param>
                /// <param name="count" type="number">
                /// The number of items to be returned.
                /// </param>
                /// <param name="processItem" optional="true" type="Function">
                /// Callback method to be called on each item fetched by data provider. Note that 
                /// callback can optionally return new item that will replace the original item in
                /// the array of collected items.
                /// </param>
                /// <returns type="WinJS.Promise">
                /// A promise which when completed returns an object in the following format:
                ///     {
                ///         items: /*array of returned items*/,
                ///         totalCount: /*total number of items that can be returned by data provider*/
                ///     }
                /// </returns>
                /// <remarks>
                /// Number of items requested in "count" parameter can be adjusted if it exceeds 
                /// the number of available items.
                /// </remarks>
                if (from < 0) {
                    BingApp.traceWarning("AggregateDataProvider.getItems: 'from' index is negative; returning fetch error.");
                    return WinJS.Promise.as(WinJS.UI.FetchError.doesNotExist);
                }

                var that = this;

                // All data providers have to be queried for their count in order to determine
                // boundaries of the items that are handled by specific provider.
                if (BingApp.Utilities.isNullOrUndefined(this.aggregateCount)) {
                    BingApp.traceInfo("AggregateDataProvider.getItems: aggregated count has not been determined yet; wait for getCount completion before continuing with getItems execution.");
                    return this.getCount().then(function () {
                        return that.getItems(from, count, processItem);
                    });
                }

                // Note that "to" is non-inclusive
                var to = from + count;

                var promises = [];

                // Determine providers that will service the request
                var startIndex = 0;
                var providersCount = this.dataProviderDescriptors.length;
                for (var indexProvider = 0; indexProvider < providersCount; indexProvider++) {
                    (function (descriptor) {
                        var providerIdentity = descriptor.dataProvider.getIdentity();

                        // Check if initial index falls within the range of items that will be
                        // serviced by the current data provider. 
                        if (typeof descriptor.count === "number" && from >= startIndex && from < descriptor.count + startIndex) {
                            var localFrom = from - startIndex;

                            // Adjust range so it does not go beyond the overall count of 
                            // items exposed by the current data provider. Note that "localTo" 
                            // is non-inclusive
                            var localTo = to - startIndex;
                            if (localTo > descriptor.count) {
                                localTo = descriptor.count;
                            }

                            BingApp.traceInfo(
                                "AggregateDataProvider.getItems: retrieving items from aggregated provider with identity '{0}' within [{1}..{2}] range.",
                                providerIdentity,
                                localFrom,
                                localTo - 1);

                            // Check if data provider has already been queried for its items. Note that 
                            // collected items will not be cached if processItem callback is specified.
                            // This is due to the fact that next time this method is called we have to
                            // guarantee that processItem is called on original item returned by data
                            // provider.
                            if (!processItem && descriptor.items && descriptor.items.length >= localTo) {
                                BingApp.traceInfo(
                                    "AggregateDataProvider.getItems: reusing previously retrieved items for aggregated provider with identity '{0}'.",
                                    providerIdentity);

                                promises.push(WinJS.Promise.as({
                                    items: descriptor.items.slice(localFrom, localTo),
                                    totalCount: descriptor.count
                                }));
                            } else {
                                promises.push(descriptor.dataProvider.getItems(localFrom, localTo - localFrom, processItem).then(
                                    function onCompleted(result) {
                                        if (result.items) {
                                            BingApp.traceInfo(
                                                "AggregateDataProvider.getItems: aggregated provider with identity '{0}' returned '{1}' items.",
                                                providerIdentity,
                                                result.items.length);
                                        } else {
                                            BingApp.traceInfo(
                                                "AggregateDataProvider.getItems: aggregated provider with identity '{0}' did not return items; returned result is '{1}'.",
                                                providerIdentity,
                                                result);
                                        }

                                        // Store collected items in internal cache so they can be 
                                        // returned quickly if they are queried for again. Again,
                                        // checking if processItem was specified and store items 
                                        // only if they did not go through processing.
                                        if (!processItem && result.items) {
                                            if (!descriptor.items) {
                                                descriptor.items = [];
                                            }

                                            BingApp.traceInfo(
                                                "AggregateDataProvider.getItems: storing items returned by aggregated provider with identity '{0}' inside cache.",
                                                providerIdentity);

                                            var itemsCount = result.items.length;
                                            for (var indexItem = 0; indexItem < itemsCount; indexItem++) {
                                                descriptor.items[localFrom + indexItem] = result.items[indexItem];
                                            }
                                        }

                                        // Update aggregate count and total count for descriptor if it was returned
                                        if (!BingApp.Utilities.isNullOrUndefined(result.totalCount) &&
                                            descriptor.count !== result.totalCount) {

                                            that.aggregateCount += result.totalCount - descriptor.count;
                                            descriptor.count = result.totalCount;

                                            BingApp.traceInfo(
                                                "AggregateDataProvider.getItems: aggregated provider with identity '{0}' returned new totalCount value '{1}'. Overall count has been updated to {2}.",
                                                providerIdentity,
                                                result.totalCount,
                                                that.aggregateCount);
                                        }

                                        return result;
                                    },
                                    function onError(err) {
                                        BingApp.traceWarning(
                                            "AggregateDataProvider.getItems: error returned while trying to retrieve items for aggregated provider with identity '{0}'. Error message: '{1}'",
                                            providerIdentity,
                                            err.message);

                                        delete descriptor.items;
                                        return WinJS.UI.FetchError.doesNotExist;
                                    }));
                            }

                            from = descriptor.count + startIndex;
                            startIndex = from;
                        } else {
                            if (typeof descriptor.count === "number") {
                                startIndex += descriptor.count;
                            }
                        }
                    })(this.dataProviderDescriptors[indexProvider]);

                    // Break if we scheduled collection of all requested items
                    if (to <= startIndex) {
                        break;
                    }
                }

                if (promises.length === 0) {
                    BingApp.traceInfo("AggregateDataProvider.getItems: none of the aggregated providers return any items. Fetch error will be returned.");
                    return WinJS.Promise.as(WinJS.UI.FetchError.doesNotExist);
                }

                // Combine all results together
                var that = this;
                return WinJS.Promise.join(promises).then(
                    function onComplete(results) {
                        var fetchError = true;
                        var aggregateItems = [];
                        results.forEach(function (result) {
                            if (result.items) {
                                fetchError = false;
                                aggregateItems.push.apply(aggregateItems, result.items);
                            }
                        });

                        if (fetchError) {
                            BingApp.traceWarning("AggregateDataProvider.getItems: none of the aggregated providers return any items. Fetch error will be returned.");
                            return WinJS.UI.FetchError.doesNotExist;
                        } else {
                            return {
                                items: aggregateItems,
                                totalCount: that.aggregateCount
                            };
                        }
                    });
            },
            invalidate: function (identity) {
                /// <summary>
                /// Invalidates results returned by all or specific data provider.
                /// </summary>
                /// <param name="identity" type="String" optional="true">
                /// String that uniquely identifies the data provider which results will be invalidated.
                /// If omitted then all results will be invalidated.
                /// </param>
                /// <remarks>
                /// This provider caches results returned by contained providers so if you want to 
                /// force collection of most recent data then you have to call this method before calling
                /// getCount and/or getItems. This method allows for invalidating results returned by 
                /// specific provider which might be useful in case aggregated providers should be 
                /// invalidated at different cadence.
                /// </remarks>
                BingApp.traceInfo(
                    "AggregateDataProvider.invalidate: invalidating internal cached data for {0}.", 
                    BingApp.Utilities.isNullOrUndefined(identity) ? "all aggregated providers" : "aggregated provider with identity '" + identity + "'.");

                this.aggregateCount = null;

                this.dataProviderDescriptors.forEach(function (descriptor) {
                    if (BingApp.Utilities.isNullOrUndefined(identity) || 
                        BingApp.Utilities.areEqualIgnoreCase(identity, descriptor.dataProvider.getIdentity())) {
                        delete descriptor.count;
                        delete descriptor.items;
                    }
                });
            }
        });

    WinJS.Namespace.define("BingApp.Classes", {
        AggregateDataProvider: AggregateDataProvider
    });
})();