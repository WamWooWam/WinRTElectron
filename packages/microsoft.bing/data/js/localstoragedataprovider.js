/// <reference path="//Microsoft.WinJS.1.0/js/base.js" />
/// <reference path="../../common/js/tracing.js" />
/// <reference path="../../common/js/utilities.js" />
/// <reference path="../../common/js/errors.js" />
(function () {
    "use strict";

    /// <summary>
    /// Defines class that implements data provider which uses local storage to store items.
    /// </summary>
    /// <remarks>
    /// Current implementation stores each item in separate entry inside local storage. The key
    /// for item entry is generated based on index which allows for quick read operation for 
    /// single item. The entries inside local storage look like this:
    ///
    ///     prefix.0 = item0
    ///     prefix.1 = item1
    ///     ................
    ///     prefix.N = itemN
    ///
    /// In order to quickly find the index of the item we store additional entry per item. The key
    /// for that entry is generated based on value of item's key property. These entries look like:
    ///
    ///     prefix.keyValueForItem0 = 0
    ///     prefix.keyValueForItem1 = 1
    ///     ................
    ///     prefix.keyValueForItemN = N
    ///
    /// This works because we require that item's key does not change.
    ///
    /// Note that there are some known performance issues with this design:
    ///     1)  Remove operation is very expensive, especially if item is removed from the top 
    ///         of index list.
    ///     2)  Bulk reads are expensive because each item is stored in separate entry.
    /// 
    /// This issues are aknowledged and being tracked via bug #224839.
    /// </remarks>
    var LocalStorageDataProvider = WinJS.Class.define(
        function (identity, key) {
            /// <summary>
            /// Creates an LocalStorageDataProvider object.
            /// </summary>
            /// <param name="identity" type="String">
            /// String that uniquely identifies this instance. Note that currently we do not have 
            /// any built in mechanism for verifying uniqueness of the identity.
            /// </param>
            /// <param name="key" type="String">
            /// The name of the property which values are unique across all items managed by 
            /// this provider.
            /// </param>
            /// <returns type="BingApp.Classes.LocalStorageDataProvider">
            /// LocalStorageDataProvider instance.
            /// </returns>
            if (!(this instanceof BingApp.Classes.LocalStorageDataProvider)) {
                BingApp.traceWarning("LocalStorageDataProvider.ctor: Attempted using LocalStorageDataProvider ctor as function; redirecting to use 'new LocalStorageDataProvider()'.");
                return new BingApp.Classes.LocalStorageDataProvider(identity, key);
            }

            if (!identity) {
                throw new BingApp.Classes.ErrorArgumentNullOrUndefined("identity");
            }

            if (!key) {
                throw new BingApp.Classes.ErrorArgumentNullOrUndefined("key");
            }

            Object.defineProperties(this, {
                identity: { value: identity, writable: false, enumerable: false, configurable: false },
                key: { value: key, writable: false, enumerable: false, configurable: false },
                items: { value: [], writable: false, enumerable: false, configurable: false },
                itemsCount: { writable: true, enumerable: false, configurable: false },
                localStoragePrefix: { value: "LocalStorageDataProvider." + identity, writable: false, enumerable: false, configurable: false },
                lastGeneratedId: { value: 0, writable: true, enumerable: false, configurable: false },
            });

            var slotForLastGeneratedId = this._getSlotForLastGeneratedId();
            if (window.localStorage.hasOwnProperty(slotForLastGeneratedId)) {
                this.lastGeneratedId = parseInt(window.localStorage.getItem(slotForLastGeneratedId));
            }
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
                var count = this._getCountInternal();
                return WinJS.Promise.as(count);
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
                    return WinJS.Promise.as(WinJS.UI.FetchError.doesNotExist);
                }

                var totalCount = this._getCountInternal();

                if (from >= totalCount) {
                    return WinJS.Promise.as(WinJS.UI.FetchError.doesNotExist);
                }

                // Note that "to" is non-inclusive
                var to = from + count;
                if (to > totalCount) {
                    to = totalCount;
                }

                var items = [];
                for (var indexItem = from; indexItem < to; indexItem++) {
                    var item = this._getItemInternal(indexItem);

                    if (processItem) {
                        var processedItem = processItem(item);
                        if (!BingApp.Utilities.isNullOrUndefined(processedItem)) {
                            item = processedItem;
                        }
                    }

                    items.push(item);
                }

                return WinJS.Promise.as({
                    items: items,
                    totalCount: totalCount
                });
            },
            addItem: function (item) {
                /// <summary>
                /// Adds new item.
                /// </summary>
                /// <param name="item">
                /// Item to be added.
                /// </param>
                /// <returns type="WinJS.Promise">
                /// A promise which when completed returns the item that was added to the provider.
                /// </returns>
                if (!item) {
                    throw new BingApp.Classes.ErrorArgumentNullOrUndefined("item");
                }

                this._ensureItemHasKeyValue(item);

                var indexSlot = this._getSlotForIndexFromItemKey(item);
                if (window.localStorage.hasOwnProperty(indexSlot)) {
                    throw new BingApp.Classes.ErrorArgument("item", WinJS.Resources.getString("error_local_storage_data_provider_item_must_have_unique_key_value").value);
                }

                var index = this._getCountInternal();
                var itemSlot = this._getSlotForItemFromIndex(index);

                window.localStorage.setItem(itemSlot, JSON.stringify(item));
                window.localStorage.setItem(indexSlot, index);

                this.items[index] = item;

                this._setCountInternal(index + 1);

                return WinJS.Promise.as(item);
            },
            updateItem: function (item) {
                /// <summary>
                /// Updates existing item.
                /// </summary>
                /// <param name="item">
                /// Item to be updated.
                /// </param>
                /// <returns type="WinJS.Promise">
                /// A promise which when completed returns the item that was stored by the provider.
                /// </returns>
                /// <remarks>
                /// Note that the value for key property cannot change for updated item.
                /// </remarks>
                if (!item) {
                    throw new BingApp.Classes.ErrorArgumentNullOrUndefined("item");
                }

                var index = this._getIndexInternal(item);
                var itemSlot = this._getSlotForItemFromIndex(index);

                window.localStorage.setItem(itemSlot, JSON.stringify(item));

                this.items[index] = item;

                return WinJS.Promise.as(item);
            },
            removeItem: function (item) {
                /// <summary>
                /// Removes existing item.
                /// </summary>
                /// <param name="item">
                /// Item to be removed.
                /// </param>
                /// <returns type="WinJS.Promise">
                /// A promise which when completed returns the item that was removed by the provider.
                /// </returns>
                if (!item) {
                    throw new BingApp.Classes.ErrorArgumentNullOrUndefined("item");
                }

                var indexRemove = this._getIndexInternal(item);
                var removedItem = this._getItemInternal(indexRemove);

                // Iterate through all items at indexes that follow the item that is being removed.
                // Note that performance of this operation is really bad if item is at the top of
                // index table. This is intentional compromise between simplicity of implementation
                // and performance of remove operation.
                var totalCount = this._getCountInternal();
                var currentSlot = this._getSlotForItemFromIndex(indexRemove);
                for (var indexItem = indexRemove; indexItem < totalCount - 1; indexItem++) {
                    var nextSlot = this._getSlotForItemFromIndex(indexItem + 1);

                    var stringifiedItem = window.localStorage.getItem(nextSlot);
                    var item = this._getItemInternal[indexItem + 1];

                    window.localStorage.setItem(currentSlot, stringifiedItem);
                    window.localStorage.setItem(this._getSlotForIndexFromItemKey(item), indexItem);

                    currentSlot = nextSlot;
                }

                // Update cached items
                this.items.splice(indexRemove, 1);

                // Release unused local storage entries
                window.localStorage.removeItem(this._getSlotForIndexFromItemKey(removedItem));
                window.localStorage.removeItem(this._getSlotForItemFromIndex(totalCount - 1));

                // Update total count
                this._setCountInternal(totalCount - 1);

                return WinJS.Promise.as(removedItem);
            },
            _getCountInternal: function () {
                /// <summary>
                /// Gets the total number of items that can be returned by data provider.
                /// </summary>
                /// <returns type="number">
                /// Total number of items that can be returned by this data provider.
                /// </returns>
                if (BingApp.Utilities.isNullOrUndefined(this.itemsCount)) {
                    var countAsString = window.localStorage.getItem(this._getSlotForTotalCount());
                    if (countAsString) {
                        this.itemsCount = parseInt(countAsString);
                    } else {
                        this.itemsCount = 0;
                    }
                }

                return this.itemsCount;
            },
            _setCountInternal: function(count) {
                /// <summary>
                /// Updates the total number of items that can be returned by data provider.
                /// </summary>
                /// <param name="count" type="number">
                /// Total number of items that can be returned by this data provider.
                /// </returns>
                this.itemsCount = count;
                window.localStorage.setItem(this._getSlotForTotalCount(), count.toString());
            },
            _getItemInternal: function (index) {
                /// <summary>
                /// Gets the item at the given index.
                /// </summary>
                /// <param name="index" type="number">
                /// The index of the item that has to be returned.
                /// </param>
                /// <returns>
                /// Item stored under the given index.
                /// </returns>
                var item = this.items[index];

                if (!item) {
                    item = JSON.parse(window.localStorage.getItem(this._getSlotForItemFromIndex(index)));
                    this.items[index] = item;
                }

                return item;
            },
            _getIndexInternal: function (item) {
                /// <summary>
                /// Gets index for given item.
                /// </summary>
                /// <param name="item">
                /// Target item.
                /// </param>
                /// <returns type="number">
                /// Index for given item. Error is thrown if item is not found.
                /// </returns>
                var slotForIndex = this._getSlotForIndexFromItemKey(item);
                var indexAsString = window.localStorage.getItem(slotForIndex);

                if (BingApp.Utilities.isNullOrUndefined(indexAsString)) {
                    throw new BingApp.Classes.ErrorArgument("item", BingApp.Utilities.format(WinJS.Resources.getString("error_local_storage_data_provider_item_must_be_inside_storage").value, item[this.key]));
                }

                return parseInt(indexAsString);
            },
            _ensureItemHasKeyValue: function (item) {
                /// <summary>
                /// Checks if given item does not have key value and if so automatically generates one.
                /// </summary>
                /// <param name="item">
                /// Target item.
                /// </param>
                var keyValue = item[this.key];
                if (BingApp.Utilities.isNullOrUndefined(keyValue)) {
                    item[this.key] = "generatedId." + this.lastGeneratedId;

                    this.lastGeneratedId++;

                    window.localStorage.setItem(this._getSlotForLastGeneratedId(), this.lastGeneratedId.toString());
                } else if (typeof keyValue !== "string") {
                    throw new BingApp.Classes.ErrorArgument("item", WinJS.Resources.getString("error_local_storage_data_provider_item_must_have_string_key_value").value);
                }
            },
            _getSlotForItemFromIndex: function (index) {
                /// <summary>
                /// Gets the name of the property that will be used to store item in local storage.
                /// </summary>
                /// <param name="index">
                /// Index of the item to store.
                /// </param>
                /// <returns type="String">
                /// Name of local storage property that will be used to store an item.
                /// </returns>
                return this.localStoragePrefix + ".items." + index;
            },
            _getSlotForIndexFromItemKey: function (item) {
                /// <summary>
                /// Gets the name of the property that will be used to store item index in local storage.
                /// </summary>
                /// <param name="item">
                /// Item which index information will be stored.
                /// </param>
                /// <returns type="String">
                /// Name of local storage property that will be used to store item's index.
                /// </returns>

                // Note that we check whether item has key value. Eventually we check for it elsewhere 
                // because it is relevant only for certain operations (update and remove). This method 
                // is used for other operations so we do not run the check for the sake of performance. 
                return this.localStoragePrefix + ".keys." + item[this.key];
            },
            _getSlotForTotalCount: function () {
                /// <summary>
                /// Gets the name of the property that will be used to store items count in local storage.
                /// </summary>
                /// <returns type="String">
                /// Name of local storage property that will be used to store items count.
                /// </returns>
                return this.localStoragePrefix + ".count";
            },
            _getSlotForLastGeneratedId: function () {
                /// <summary>
                /// Gets the name of the property that will be used to store items count in local storage.
                /// </summary>
                /// <returns type="String">
                /// Name of local storage property that will be used to store items count.
                /// </returns>
                return this.localStoragePrefix + ".lastGeneratedId";
            },
        });

    WinJS.Namespace.define("BingApp.Classes", {
        LocalStorageDataProvider: LocalStorageDataProvider
    });
})();