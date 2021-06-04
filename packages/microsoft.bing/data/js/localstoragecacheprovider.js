/// <reference path="//Microsoft.WinJS.1.0/js/base.js" />
/// <reference path="../../common/js/tracing.js" />
/// <reference path="../../common/js/utilities.js" />
/// <reference path="../../common/js/errors.js" />
/// <reference path="localstoragedataprovider.js" />
(function () {
    "use strict";

    /// <summary>
    /// Defines class that implements data provider which uses local storage to store items.
    /// </summary>
    var LocalStorageCacheProvider = WinJS.Class.derive(
        BingApp.Classes.LocalStorageDataProvider,
        function (identity, key) {
            /// <summary>
            /// Creates an LocalStorageCacheProvider object.
            /// </summary>
            /// <param name="identity" type="String">
            /// String that uniquely identifies this instance. Note that currently we do not have 
            /// any built in mechanism for verifying uniqueness of the identity.
            /// </param>
            /// <param name="key" type="String">
            /// The name of the property which values are unique across all items managed by 
            /// this provider.
            /// </param>
            /// <returns type="BingApp.Classes.LocalStorageCacheProvider">
            /// LocalStorageCacheProvider instance.
            /// </returns>
            if (!(this instanceof BingApp.Classes.LocalStorageCacheProvider)) {
                BingApp.traceWarning("LocalStorageCacheProvider.ctor: Attempted using LocalStorageCacheProvider ctor as function; redirecting to use 'new LocalStorageCacheProvider()'.");
                return new BingApp.Classes.LocalStorageCacheProvider(identity, key);
            }

            BingApp.Classes.LocalStorageDataProvider.call(this, identity, key);
        },
        {
            clear: function () {
                /// <summary>
                /// Removes all items stored by this object.
                /// </summary>
                /// <returns type="WinJS.Promise">
                /// A promise which completes when all items are removed.
                /// </returns>
                // Clear local storage 
                for (var indexStorageKey = window.localStorage.length - 1; indexStorageKey >= 0; indexStorageKey--){
                    var storageKey = window.localStorage.key(indexStorageKey);
                    if (storageKey.indexOf(this.localStoragePrefix) === 0) {
                        window.localStorage.removeItem(storageKey);
                    }
                }

                this.items.length = 0;

                this._setCountInternal(0);

                this.lastGeneratedId = 0;
                window.localStorage.setItem(this._getSlotForLastGeneratedId(), this.lastGeneratedId.toString());

                return WinJS.Promise.as();
            },
            addItems: function (items) {
                /// <summary>
                /// Adds new items.
                /// </summary>
                /// <param name="items">
                /// Array of items to be added.
                /// </param>
                /// <returns type="WinJS.Promise">
                /// A promise which when completed returns the items that were added to the provider.
                /// </returns>
                if (!items) {
                    throw new BingApp.Classes.ErrorArgumentNullOrUndefined("items");
                }

                var currentCount = this._getCountInternal();
                for (var indexItem = 0; indexItem < items.length; indexItem++) {
                    var item = items[indexItem];

                    this._ensureItemHasKeyValue(item);

                    var indexSlot = this._getSlotForIndexFromItemKey(item);
                    if (window.localStorage.hasOwnProperty(indexSlot)) {
                        throw new BingApp.Classes.ErrorArgument("item", WinJS.Resources.getString("error_local_storage_data_provider_item_must_have_unique_key_value").value);
                    }

                    var indexInStorage = indexItem + currentCount;
                    var itemSlot = this._getSlotForItemFromIndex(indexInStorage);

                    window.localStorage.setItem(itemSlot, JSON.stringify(item));
                    window.localStorage.setItem(indexSlot, indexInStorage);

                    this.items[indexInStorage] = item;
                }

                this._setCountInternal(indexItem + currentCount);

                return WinJS.Promise.as(items);
            },
        });

    WinJS.Namespace.define("BingApp.Classes", {
        LocalStorageCacheProvider: LocalStorageCacheProvider
    });
})();