/// <reference path="//Microsoft.WinJS.1.0/js/base.js" />
/// <reference path="//Microsoft.WinJS.1.0/js/ui.js" />
/// <reference path="../../common/js/tracing.js" />
/// <reference path="../../common/js/utilities.js" />
/// <reference path="../../common/js/errors.js" />
/// <reference path="aggregatedataprovider.js" />
(function () {
    "use strict";

    /// <summary>
    /// Defines class that implements read-only data provider which aggregates based on data provider priority and exposes items 
    /// supplied by set of data providers.
    /// </summary>
    var PriorityAggregateDataProvider = WinJS.Class.derive(
        BingApp.Classes.AggregateDataProvider,
        function (identity, dataProviders, criticalDataProviders) {
            /// <summary>
            /// Creates an PriorityAggregateDataProvider object.
            /// </summary>
            /// <param name="identity" type="String">
            /// String that uniquely identifies this instance. Note that currently we do not have 
            /// any built in mechanism for verifying uniqueness of the identity.
            /// </param>
            /// <param name="dataProviders" type="Array">
            /// Array of data providers that will supply items for aggregation.
            /// </param>
            /// <param name="criticalDataProviders" type="Array of type dataProviders">
            /// Array of critical data providers whose data must be returned by the aggregator
            /// </param>
            /// <returns type="BingApp.Classes.PriorityAggregateDataProvider">
            /// PriorityAggregateDataProvider instance.
            /// </returns>
            if (!(this instanceof BingApp.Classes.PriorityAggregateDataProvider)) {
                BingApp.traceWarning("PriorityAggregateDataProvider.ctor: Attempted using PriorityAggregateDataProvider ctor as function; redirecting to use 'new AggregateDataProvider()'.");
                return new BingApp.Classes.PriorityAggregateDataProvider(identity, dataProviders, criticalDataProviders);
            }

            if (!criticalDataProviders) {
                throw new BingApp.Classes.ErrorArgumentNullOrUndefined("criticalDataProviders");
            }

            Object.defineProperties(this, {
                criticalDataProviders: { value: [], writable: false }
            });

            var self = this;
            criticalDataProviders.forEach(function (criticalDataProvider) {
                self.criticalDataProviders[criticalDataProvider.getIdentity()] = true;
            });

            BingApp.Classes.AggregateDataProvider.call(this, identity, dataProviders);
        },
        {
            getCount: function () {
                /// <summary>
                /// Gets the total number of items that can be returned by data provider.
                /// </summary>
                /// <returns type="WinJS.Promise">
                /// A promise which when completed returns the total number of items that can be 
                /// returned by data provider. This method overrides the base class method.
                /// </returns>
                var self = this;
                return BingApp.Classes.AggregateDataProvider.prototype.getCount.call(this).then(
                    function onCompleted(count) {
                        if (count === 0) {
                            return count;
                        }
                        else {
                            return self._processGetCountResults();
                        }
                    });
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
                var self = this;
                return BingApp.Classes.AggregateDataProvider.prototype.getItems.call(this, from, count, processItem).then(
                    function onCompleted(result) {
                        return self._processGetItemResults(result);
                    });
            },
            _processGetCountResults: function () {
                /// <summary>
                /// Processes the response of getCount from the base aggregrator class
                /// </summary>
                /// <returns type="WinJS.Promise">
                /// A promise which when completed returns the total number of items that can be 
                /// returned by data provider. 
                /// </returns>
                var self = this;
                var success = this.dataProviderDescriptors.every(function (descriptor, index, array) {
                    var providerIdentity = descriptor.dataProvider.getIdentity();
                    if (self.criticalDataProviders[providerIdentity]) {
                        // this is a critical data provider
                        if (!descriptor.count) {
                            BingApp.traceInfo("PriorityAggregateDataProvider._processGetCountResults: count not returned for provider with identity '{0}'.", providerIdentity);
                            return false;
                        } else {
                            return true;
                        }
                    } else {
                        return true;
                    }
                });

                if (!success) {
                    this.aggregateCount = 0;
                }

                return this.aggregateCount;
            },
            _processGetItemResults: function (result) {
                /// <summary>
                /// Processes the response of getItems from the base aggregrator class
                /// </summary>
                /// <param name="result" type="Promise">
                /// Promise returned by the base class getItems method
                /// </param>
                /// <returns type="WinJS.Promise">
                /// A promise which when completed returns an object in the following format:
                ///     {
                ///         items: /*array of returned items*/,
                ///         totalCount: /*total number of items that can be returned by data provider*/
                ///     }
                /// </returns>
                /// <remarks>
                var self = this;
                var success = this.dataProviderDescriptors.every(function (descriptor, index, array) {
                    var providerIdentity = descriptor.dataProvider.getIdentity();
                    if (self.criticalDataProviders[providerIdentity]) {
                        // this is a critical data provider
                        if (!descriptor.items || descriptor.items.length === 0) {
                            BingApp.traceInfo("PriorityAggregateDataProvider._processGetItemResults: items could not be returned for provider with identity '{0}'.", providerIdentity);
                            return false;
                        } else {
                            return true;
                        }
                    } else {
                        return true;
                    }
                });

                return success ? result : WinJS.UI.FetchError.doesNotExist;
            }
        });

    WinJS.Namespace.define("BingApp.Classes", {
        PriorityAggregateDataProvider: PriorityAggregateDataProvider
    });
})();