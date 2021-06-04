/// <reference path="//Microsoft.WinJS.1.0/js/base.js" />
/// <reference path="../../common/js/tracing.js" />
/// <reference path="../../common/js/utilities.js" />
/// <reference path="../../common/js/errors.js" />
(function () {
    "use strict";

    /// <summary>
    /// Defines class that implements in-memory data provider which uses array to store items.
    /// </summary>
    var ArrayDataProvider = WinJS.Class.define(
        function (identity, key, initialItems) {
            /// <summary>
            /// Creates an ArrayDataProvider object.
            /// </summary>
            /// <param name="identity" type="String">
            /// String that uniquely identifies this instance. Note that currently we do not have 
            /// any built in mechanism for verifying uniqueness of the identity.
            /// </param>
            /// <param name="key" type="String">
            /// The name of the property which values are unique across all items managed by 
            /// this provider.
            /// </param>
            /// <param name="initialItems" type="Array" optional="true">
            /// Initial set of items returned by this provider.
            /// </param>
            /// <returns type="BingApp.Classes.ArrayDataProvider">
            /// ArrayDataProvider instance.
            /// </returns>
            if (!(this instanceof BingApp.Classes.ArrayDataProvider)) {
                BingApp.traceWarning("ArrayDataProvider.ctor: Attempted using ArrayDataProvider ctor as function; redirecting to use 'new ArrayDataProvider()'.");
                return new BingApp.Classes.ArrayDataProvider(identity, key, initialItems);
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
                keys: { value: {}, writable: false, enumerable: false, configurable: false },
                lastGeneratedId: { value: 0, writable: true, enumerable: false, configurable: false },
            });

            var that = this;
            if (initialItems) {
                initialItems.forEach(function (item) {
                    that.addItem(item);
                });
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
                return WinJS.Promise.as(this.items.length);
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

                var itemsCount = this.items.length;

                if (from >= itemsCount) {
                    return WinJS.Promise.as(WinJS.UI.FetchError.doesNotExist);
                }

                // Note that "to" is non-inclusive
                var to = from + count;
                if (to > itemsCount) {
                    to = itemsCount;
                }

                var itemsSet = this.items.slice(from, to);

                if (processItem) {
                    for (var indexItem = 0; indexItem < itemsSet.length; indexItem++) {
                        var processedItem = processItem(itemsSet[indexItem]);
                        if (!BingApp.Utilities.isNullOrUndefined(processedItem)) {
                            itemsSet[indexItem] = processedItem;
                        }
                    }
                }

                return WinJS.Promise.as({
                    items: itemsSet,
                    totalCount: itemsCount
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
                var keyValue = this._getOrCreateItemKeyValue(item);
                if (this.keys.hasOwnProperty(keyValue)) {
                    throw new BingApp.Classes.ErrorArgument("item", WinJS.Resources.getString("error_array_data_provider_item_must_have_unique_key_value").value);
                }

                this.keys[keyValue] = this.items.length;

                this.items.push(item);

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
                var index = this._getItemIndex(item);

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
                var keyValue = this._getItemKeyValue(item);
                var indexRemove = this._getItemIndex(item);

                var itemsCount = this.items.length;
                for (var indexItem = indexRemove; indexItem < itemsCount - 1; indexItem++) {
                    var existingItem = this.items[indexItem + 1];
                    var existingKeyValue = existingItem[this.key];
                    this.keys[existingKeyValue] = indexItem;
                }

                var removedItem = this.items.splice(indexRemove, 1)[0];

                delete this.keys[keyValue];

                return WinJS.Promise.as(removedItem);
            },
            _getItemKeyValue: function (item) {
                /// <summary>
                /// Extracts value of key property from given item.
                /// </summary>
                /// <param name="item">
                /// Target item.
                /// </param>
                /// <returns type="String">
                /// Value for key property.
                /// </returns>
                if (!item) {
                    throw new BingApp.Classes.ErrorArgumentNullOrUndefined("item");
                }

                return item[this.key];
            },
            _getOrCreateItemKeyValue: function (item) {
                /// <summary>
                /// Attempts extracting value of key property from given item and if fails then 
                /// create new key value automatically.
                /// </summary>
                /// <param name="item">
                /// Target item.
                /// </param>
                /// <returns type="String">
                /// Value for key property.
                /// </returns>
                if (!item) {
                    throw new BingApp.Classes.ErrorArgumentNullOrUndefined("item");
                }

                var keyValue = item[this.key];

                if (BingApp.Utilities.isNullOrUndefined(keyValue)) {
                    keyValue = "generatedId." + this.lastGeneratedId;
                    item[this.key] = keyValue;

                    this.lastGeneratedId++;
                } else if (typeof keyValue !== "string") {
                    throw new BingApp.Classes.ErrorArgument("item", WinJS.Resources.getString("error_array_data_provider_item_must_have_string_key_value").value);
                }

                return keyValue;
            },
            _getItemIndex: function (item) {
                /// <summary>
                /// Gets index for given item.
                /// </summary>
                /// <param name="item">
                /// Target item.
                /// </param>
                /// <returns type="number">
                /// Index for given item. Error is thrown if item is not found.
                /// </returns>
                var keyValue = this._getItemKeyValue(item);

                var index = this.keys[keyValue];

                if (typeof index === "undefined") {
                    throw new BingApp.Classes.ErrorArgument("item", BingApp.Utilities.format(WinJS.Resources.getString("error_array_data_provider_item_must_be_inside_array").value, keyValue));
                }

                return index;
            }
        });

    WinJS.Namespace.define("BingApp.Classes", {
        ArrayDataProvider: ArrayDataProvider
    });
})();