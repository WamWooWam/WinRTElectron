/// <reference path="//Microsoft.WinJS.1.0/js/base.js" />
/// <reference path="../../common/js/tracing.js" />
/// <reference path="../../common/js/utilities.js" />
/// <reference path="../../common/js/errors.js" />

(function () {
    "use strict";


    function getItems(from, count, processItem, options) {
        /// <summary>
        /// Gets the items within given range.
        /// </summary>
        /// <param name="from" type="number">
        /// The index of the first item that has to be returned. This should always be zero for xhr data providers
        /// </param>
        /// <param name="count" type="number">
        /// The number of items to be returned. xhr data provider returns as many as it has
        /// </param>
        /// <param name="processItem" optional="true" type="Function">
        /// Callback method to be called on each item fetched by data provider. Note that 
        /// callback can optionally return new item that will replace the original item in
        /// the array of collected items.
        /// </param>
        /// <param name="options" type="Object">
        ///     urlOptions: Required. a hash that is ultimately passed WinJS.XHR, so all options including url and headers can be put in here.
        ///     parser: Required. A function that parses the returned document
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

        if (BingApp.Utilities.isNullOrUndefined(from)) {
            from = 0;
        }

        if (from !== 0) {
            throw new BingApp.Classes.ErrorArgument("from", "From should be zero for this data provider");
        }

        var urlOptions = options.urlOptions;
        var parser = options.parser;

        var request;
        return new WinJS.Promise(
            function init(complete, error) {
                var xhrOptions;
                try {
                    xhrOptions = urlOptions();
                } catch (err) {
                    BingApp.traceError("XhrDataProvider: url options are invalid - error name: {0}, error message: {1}", err.name ? err.name : "", err.message ? err.message : "");
                    complete(WinJS.UI.FetchError.doesNotExist);
                    return;
                }
                if (!xhrOptions.url) {
                    BingApp.traceError("XhrDataProvider: url is undefined in urlOptions");
                    complete(WinJS.UI.FetchError.doesNotExist);
                    return;
                }
                request = WinJS.xhr(xhrOptions);
                request.done(
                    function onComplete(response) {
                        try {
                            var results = parser(response.responseText);
                        } catch (err) {
                            BingApp.traceError("XhrDataProvider: parser was not able to parse response from: {0} - error name: {1}, error message: {2}", xhrOptions.url, err.name ? err.name : "", err.message ? err.message : "");
                            complete(WinJS.UI.FetchError.doesNotExist);
                            return;
                        }
                        if (results.length === 0) {
                            BingApp.traceError("XhrDataProvider: parser did not return any valid data");
                            complete(WinJS.UI.FetchError.doesNotExist);
                            return;
                        }
                        if (processItem) {
                            for (var indexItem = 0; indexItem < results.length; indexItem++) {
                                var processedItem = processItem(results[indexItem]);
                                if (!BingApp.Utilities.isNullOrUndefined(processedItem)) {
                                    results[indexItem] = processedItem;
                                }
                            }
                        }

                        complete({
                            items: results,
                            totalCount: results.length
                        });
                    },
                    function onError(err) {
                        //handling all the errors from XHR
                        BingApp.traceError("XhrDataProvider: xhr request failed - error name: {0}, error message: {1}", err.name ? err.name : "", err.message ? err.message : "");
                        complete(WinJS.UI.FetchError.doesNotExist);
                    });
            },
            function cancel() {
                request && request.cancel();
            });
    }


    /// <summary>
    /// Defines class that implements parent class for all remote data providers.
    /// </summary>
    var XhrDataProvider = WinJS.Class.define(
        function (identity, count, options) {
            /// <summary>
            /// Creates an XhrDataProvider object.
            /// </summary>
            /// <param name="identity" type="Object">
            /// String that uniquely identifies this instance. Note that currently we do not have 
            /// any built in mechanism for verifying uniqueness of the identity.
            /// </param>
            /// <param name="count" type="Number">
            /// value of the maximum number of items in the feed
            /// </param>
            /// <param name="options" type="Object">
            ///     urlOptions: Required. a hash that is ultimately passed WinJS.XHR, so all options including url and headers can be put in here.
            ///     parser: Required. A function that parses the returned document
            /// </param>
            /// <returns type="BingApp.Classes.XhrDataProvider">
            /// XhrDataProvider instance.
            /// </returns>
            if (!(this instanceof BingApp.Classes.XhrDataProvider)) {
                BingApp.traceWarning("XhrDataProvider.ctor: Attempted using XhrDataProvider ctor as function; redirecting to use 'new XhrDataProvider()'.");
                return new BingApp.Classes.XhrDataProvider(identity, count, options);
            }

            if (!identity) {
                throw new BingApp.Classes.ErrorArgumentNullOrUndefined("identity");
            }

            if (BingApp.Utilities.isNullOrUndefined(count)) {
                throw new BingApp.Classes.ErrorArgumentNullOrUndefined("count");
            }

            if (count === 0) {
                throw new BingApp.Classes.ErrorArgument("count", "Count cannot be zero");
            }

            if (!options) {
                throw new BingApp.Classes.ErrorArgumentNullOrUndefined("options");
            }

            if (!options.urlOptions) {
                throw new BingApp.Classes.ErrorArgumentNullOrUndefined("urlOptions");
            }

            if (!options.parser) {
                throw new BingApp.Classes.ErrorArgumentNullOrUndefined("parser");
            }

            if (typeof options.urlOptions !== "function") {
                throw new BingApp.Classes.ErrorArgument("urlOptions");
            }

            if (typeof options.parser !== "function") {
                throw new BingApp.Classes.ErrorArgument("parser");
            }


            Object.defineProperties(this, {
                identity: { value: identity, writable: false, enumerable: false, configurable: false },
                count: { value: count, writable: false, enumerable: false, configurable: false },
            });

            this.getItems = function (from, count, processItem) {
                return getItems(from, count, processItem, options);
            };

        },
        {
            getIdentity: function () {
                /// <summary>
                /// Gets the string that uniquely identifies this instance of data provider.
                /// </summary>
                /// <returns type="Object">
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
                /// returned by data provider. The promise is instant for this provider
                /// </returns>

                return WinJS.Promise.as(this.count);
            }
        });

    WinJS.Namespace.define("BingApp.Classes", {
        XhrDataProvider: XhrDataProvider
    });

})();
