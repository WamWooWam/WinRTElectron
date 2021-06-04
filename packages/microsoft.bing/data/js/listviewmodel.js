/// <reference path="//Microsoft.WinJS.1.0/js/base.js" />
/// <reference path="//Microsoft.WinJS.1.0/js/ui.js" />
/// <reference path="../../common/js/tracing.js" />
/// <reference path="../../common/js/utilities.js" />
/// <reference path="../../common/js/errors.js" />
/// <reference path="../../common/js/eventsource.js" />
/// <reference path="datautilities.js" />
(function () {
    "use strict";

    /// <summary>
    /// Static list of events raised by ListViewModel.
    /// </summary>
    var events = Object.freeze({
        /// <summary>
        /// This event is raised when ListViewModel refresh operation is about to start.
        /// </summary>
        refreshStarting: "refreshStarting",
        /// <summary>
        /// This event is raised after ListViewModel refresh operation is completed.
        /// Event arguments are set to the object in the following format:
        ///     {
        ///         canceled: /*Optional. Set to true if refresh operation was cancelled.*/
        ///     }
        /// </summary>
        refreshFinished: "refreshFinished",
        /// <summary>
        /// This event is raised when existing items are about to be removed from the list.
        /// Event arguments are set to the array of items that will be removed.
        /// </summary>
        itemsRemoving: "itemsRemoving",
        /// <summary>
        /// This event is raised after items were removed from the list. Event arguments are 
        /// set to the array of removed items.
        /// </summary>
        itemsRemoved: "itemsRemoved",
        /// <summary>
        /// This event is raised when new items are about to be added to the list.
        /// Event arguments are set to the array of new items.
        /// </summary>
        itemsAdding: "itemsAdding",
        /// <summary>
        /// This event is raised after new items were added to the list.
        /// Event arguments are set to the array of new items.
        /// </summary>
        itemsAdded: "itemsAdded",
    });

    /// <summary>
    /// Defines class that implements view model for a list of data items. This view model will allow 
    /// for caching of data which enables use of this view model in offline scenario 
    /// </summary>
    var ListViewModel = WinJS.Class.derive(
        BingApp.Classes.EventSource,
        function constructor(dataProvider, cacheProvider) {
            /// <summary>
            /// Creates an ListViewModel object.
            /// </summary>
            /// <param name="dataProvider" type="IDataProvider">
            /// Data provider that is used to retrieve data exposed by this view model.
            /// </param>
            /// <param name="cacheProvider" optional="true" type="ICacheProvider">
            /// Cache provider that is used to preserve data returned by data provider.
            /// </param>
            /// <returns type="BingApp.Classes.ListViewModel">
            /// ListViewModel instance.
            /// </returns>
            if (!(this instanceof BingApp.Classes.ListViewModel)) {
                BingApp.traceWarning("ListViewModel.ctor: Attempted using ListViewModel ctor as function; redirecting to use 'new ListViewModel()'.");
                return new BingApp.Classes.ListViewModel(dataProvider, cacheProvider);
            }

            if (!dataProvider) {
                throw new BingApp.Classes.ErrorArgumentNullOrUndefined("dataProvider");
            }

            BingApp.Classes.EventSource.call(this);

            Object.defineProperties(this, {
                dataProvider: { value: dataProvider, writable: false, enumerable: false, configurable: false },
                cacheProvider: { value: cacheProvider, writable: false, enumerable: false, configurable: false },
                list: { value: new WinJS.Binding.List(), writable: false, enumerable: false, configurable: false },
                refreshOperation: { writable: true, enumerable: false, configurable: false },
            });

            // Pre-populate list with data from cache
            if (this.cacheProvider) {
                var that = this;
                BingApp.Data.getAllItems(this.cacheProvider).then(function (items) {
                    var countItemsInCache = items.length;
                    if (countItemsInCache > 0) {
                        BingApp.traceInfo("ListViewModel.ctor: populating list with data stored in cache ('{0} items overall').", countItemsInCache);
                        that.list.push.apply(that.list, items);
                    }
                })
            }
        },
        {
            getList: function () {
                /// <summary>
                /// Gets the list object representing the data exposed by this view model.
                /// </summary>
                /// <returns type="WinJS.Binding.List">
                /// List object with view model data.
                /// </returns>
                /// <remarks>
                /// The list content will be automatically updated when data provider returns more data.
                /// However, this view model will not listen to any changes to list content that are done
                /// via List API.
                /// </remarks>
                return this.list;
            },
            refresh: function (options) {
                /// <summary>
                /// Repopulates list with the data returned by data provider.
                /// </summary>
                /// <param name="options" optional="true">
                /// Options that affect how data is collected from data provider:
                ///     {
                ///         from: /*index of the first item that will be retrieved; if omitted then it is zero*/,
                ///         count: /*max number of items that will be returned; if omitted then there is no limit*/
                ///         processItem: /*callback function that will be called on each item returned by data provider;
                ///                         item is specified as function parameter. Note that callback can optionally 
                ///                         return new item that will replace the original item*/
                ///         bufferWithCount: /*size of the batch of items that have to be collected from data provider 
                ///                             before added to the list; if omitted then items will be added as they 
                ///                             arrive (i.e. batch size is 1)*/,
                ///         bufferWithTime: /*period of time (in milliseconds) during which items collected from data 
                ///                             provider are batched before added to the list; if omitted then items 
                ///                             are added to the list without delay. If both bufferWithCount and 
                ///                             bufferWithTime are specified then batching is over when both 
                ///                             conditions are met.*/,
                ///     }
                /// </param>
                /// <returns type="WinJS.Promise">
                /// A promise which completes when refresh is complete.
                /// </returns>

                // Return promise for current refresh operation if it is already running
                if (this.refreshOperation) {
                    BingApp.traceInfo("ListViewModel.refresh: method is called while previous refresh did not finish yet; returning promise for refresh operation that is already running.");
                    return this.refreshOperation;
                }

                BingApp.traceInfo("ListViewModel.refresh: starting operation and raising 'refreshStarting' event.");

                this.fireEvent(events.refreshStarting);

                var that = this;
                var getAllItemsOperation;
                var refreshFinished = false;
                this.refreshOperation = new WinJS.Promise(
                    function init(complete, error) {
                        options = options || {};

                        // Define a callback that will be used to process items; note that it will override
                        // the original callback so we have to preserve it.
                        var processItem = options.processItem;
                        var bufferWithCount = options.bufferWithCount || 1;
                        var bufferWithTime = options.bufferWithTime || 0;

                        var collectionCompleted = false;

                        var batchTimeoutExpired = false;
                        var setupBufferTimeout = function () {
                            batchTimeoutExpired = false;
                            if (bufferWithTime > 0) {
                                setTimeout(function () {
                                    batchTimeoutExpired = true;
                                    if (collectionCompleted) {
                                        processBatch();
                                    }
                                }, bufferWithTime);
                            } else {
                                batchTimeoutExpired = true;
                            }
                        };

                        setupBufferTimeout();

                        var firstItem = true;
                        var batch = [];
                        var processBatch = function () {
                            var itemsCountInBatch = batch.length;

                            var continueWithProcessing;
                            if (!batchTimeoutExpired) {
                                BingApp.traceVerbose(
                                    "ListViewModel.refresh.processBatch: collected '{0}' items in batch but current time buffer of {1} milliseconds has not expired yet. Waiting until timeout expires.",
                                    itemsCountInBatch,
                                    bufferWithTime);
                                continueWithProcessing = false;
                            } else if (collectionCompleted) {
                                BingApp.traceVerbose("ListViewModel.refresh.processBatch: item collection has been completed; need to process last batch of collected items.");
                                continueWithProcessing = true;
                            } else if (batch.length >= bufferWithCount && batchTimeoutExpired) {
                                BingApp.traceVerbose("ListViewModel.refresh.processBatch: item collection has not been completed yet but batching conditions have been met for processing items collected so far.");
                                continueWithProcessing = true;
                            } else {
                                BingApp.traceVerbose(
                                    "ListViewModel.refresh.processBatch: collected '{0}' items in batch but current min count buffer of {1} items has not been reached yet. Waiting until necessary number of items is collected.",
                                    itemsCountInBatch,
                                    bufferWithCount);
                                continueWithProcessing = false;
                            }

                            if (continueWithProcessing) {
                                // Clear existing content when first item arrives
                                if (firstItem) {
                                    firstItem = false;

                                    if (that.list.length > 0) {
                                        var existingItems = that.list.map(function (existingItem) { return existingItem; });

                                        BingApp.traceVerbose(
                                            "ListViewModel.refresh.processBatch: first batch of items has arrived; existing content ('{0}' items) and cache will be cleared now. Raising 'itemsRemoving' event.",
                                            existingItems.length);

                                        that.fireEvent(events.itemsRemoving, { items: existingItems });

                                        that.list.length = 0;

                                        BingApp.traceVerbose("ListViewModel.refresh.processBatch: existing content and cache has been cleared. Raising 'itemsRemoved' event.");

                                        that.fireEvent(events.itemsRemoved, { items: existingItems });
                                    }

                                    if (that.cacheProvider) {
                                        that.cacheProvider.clear();
                                    }
                                }

                                if (itemsCountInBatch > 0) {
                                    BingApp.traceVerbose("ListViewModel.refresh.processBatch: started processing of '{0}' items in single batch. Raising 'itemsAdding' event.", itemsCountInBatch);

                                    // Process items if required
                                    if (processItem) {
                                        for (var indexItem = 0; indexItem < itemsCountInBatch; indexItem++) {
                                            var processedItem = processItem(batch[indexItem]);
                                            if (!BingApp.Utilities.isNullOrUndefined(processedItem)) {
                                                batch[indexItem] = processedItem;
                                            }
                                        }
                                    }

                                    var batchItems = [].concat(batch);

                                    that.fireEvent(events.itemsAdding, { items: batchItems });

                                    batch.forEach(function (batchItem) {
                                        that.list.push(batchItem);

                                        BingApp.traceVerbose("ListViewModel.refresh: processed item #{0}", that.list.length);
                                    });

                                    if (that.cacheProvider) {
                                        that.cacheProvider.addItems(batch);
                                    }

                                    BingApp.traceVerbose(
                                        "ListViewModel.refresh.processBatch: finished processing of '{0}' items in single batch. Raising 'itemsAdded' event.",
                                        itemsCountInBatch);

                                    that.fireEvent(events.itemsAdded, { items: batchItems });

                                    batch.length = 0;
                                }

                                // IMPORTANT:   The reason why we handle completion here has to do with the fact 
                                //              that it may be delayed due to bufferWithTime option. In that case
                                //              we have to wait until buffering is done before processing the last batch.
                                if (collectionCompleted) {
                                    BingApp.traceInfo(
                                        "ListViewModel.refresh: operation is completed. Overall collected '{0}' items. Raising 'refreshFinished' event.",
                                        that.list.length);

                                    that.fireEvent(events.refreshFinished, { canceled: false });
                                    refreshFinished = true;

                                    that.refreshOperation = null;

                                    complete();
                                } else {
                                    setupBufferTimeout();
                                }
                            }
                        };

                        var invalidateProvider = that.dataProvider.invalidate ? that.dataProvider.invalidate : function () {
                            return WinJS.Promise.as();
                        };

                        var getAllItemsOptions = Object.create(options);
                        getAllItemsOptions.processItem = function (item) {
                            if (firstItem || !getAllItemsOptions.count || that.list.length < getAllItemsOptions.count) {
                                batch.push(item);
                                processBatch();
                            }
                        };

                        getAllItemsOperation = BingApp.Data.getAllItems(that.dataProvider, getAllItemsOptions);
                        
                        return getAllItemsOperation.then(
                            function onComplete() {
                                collectionCompleted = true;

                                // IMPORTANT:   Promise completion is handled inside processBatch it may be 
                                //              delayed due to bufferWithTime option. In that case we have 
                                //              to wait until buffering is done before processing the last batch.
                                processBatch();
                            },
                            function onError(err) {
                                if (BingApp.Utilities.isPromiseCancellationError(err)) {
                                    BingApp.traceInfo("ListViewModel.refresh: operation is canceled. Raising 'refreshFinished' event.");

                                    that.fireEvent(events.refreshFinished, { canceled: true });
                                    refreshFinished = true;

                                    that.refreshOperation = null;

                                    complete();
                                } else {
                                    error(err);
                                }
                            });
                    },
                    function cancel() {
                        if (getAllItemsOperation) {
                            getAllItemsOperation.cancel();
                        }
                    });

                // Check if refresh operation completed synchronously; that would be the case if data 
                // provider returns all data synchronously and there is no bufferWithTime option.
                if (refreshFinished) {
                    this.refreshOperation = null;
                }

                return this.refreshOperation ? this.refreshOperation : WinJS.Promise.as();
            },
        },
        {
            events: events,
        });

    WinJS.Namespace.define("BingApp.Classes", {
        ListViewModel: ListViewModel
    });
})();