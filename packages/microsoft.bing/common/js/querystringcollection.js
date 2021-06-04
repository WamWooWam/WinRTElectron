/// <reference path='//Microsoft.WinJS.1.0/js/base.js' />
/// <reference path='tracing.js' />
/// <reference path='errors.js' />
(function () {
    "use strict";

    var encodeExceptions = {
        setflight: true // escape, encodeURI, encodeURIComponent all replace ':' by %3A which messes up ?setflight
    };

    var parse = function (querystring, options) {
        /// <summary>
        /// Parses a querystring ?q=ah&form=noway into a key-value pair collection
        /// </summary>
        /// <param name="querystring" type="String">
        /// Querystring to parse, typically of the form ?q=ah&form=noway
        /// </param>
        /// <param name="options" type="Object">
        /// decode: bool    set to true if keys and values are URL encoded, default true
        /// </param>
        /// <returns>
        /// A key-value representation of the querystring
        /// </returns>
        /// <remarks>
        /// If there are key-wise duplicates in the querystring, the last one set wins
        /// </remarks>
        var collection = {};
        if (!querystring) {
            return collection;
        }

        var search = querystring.substr(querystring.indexOf("?") + 1);
        var decode = function (e) { return e; };
        if (options && options.decode) {
            decode = function (e) { 
                // decodeURIComponent does not decode + (used to replace spaces)
                return decodeURIComponent(e.replace(/\+/g, '%20')); 
            };
        }

        search.split("&").forEach(function (pair) {
            var parts = pair.split("=", 2);
            var key = decode(parts[0]);
            var value = parts[1] || '';
            if (value) {
                value = decode(value);
            }

            if (key.trim()) {
                BingApp.traceVerbose("BingApp.Utilities.QueryString.parse: key='{0}', value='{1}'", key, value);
                collection[key] = value;
            }
        });

        BingApp.traceVerbose("BingApp.Utilities.QueryString.parse: {0} to {1}", querystring, JSON.stringify(collection));

        return collection;
    };

    var serialize = function (collection) {
        /// <summary>
        /// Serializes a key-value collection to a querystring
        /// </summary>
        /// <param name="collection" type="Object">
        /// A hash containing key-value pairs
        /// </param>
        /// <returns>
        /// A URL encoded querystring, starting with '?'
        /// </returns>
        var params = [];
        if (collection) {
            Object.keys(collection).forEach(function (key) {
                if (key.toLowerCase() in encodeExceptions) {
                    params.push(key + "=" + collection[key]); 
                }
                else {
                    params.push(encodeURIComponent(key) + "=" + encodeURIComponent(collection[key]));
                }
            });
        }

        var querystring = "?" + params.join("&");

        BingApp.traceVerbose("BingApp.Utilities.QueryString.serialize: {0} to {1}", JSON.stringify(collection), querystring);

        return querystring;
    };

    var remove = function (querystring, keys) {
        /// <summary>
        /// Removes given set of keys from given query string.
        /// </summary>
        /// <param name="querystring" type="String">
        /// Encoded query string, typically of the form ?q=ah&form=noway
        /// </param>
        /// <param name="keys">
        /// A single key or an array of keys that has to be removed from given query string.
        /// </param>
        /// <returns>
        /// A URL encoded query string without key-value pairs for given keys.
        /// </returns>
        if (!querystring || !keys) {
            return querystring;
        }

        // If single key is passed is passed then convert it to array
        if (typeof keys === "string") {
            keys = [keys];
        }

        var queryCollection = parse(querystring, { decode: true });
        keys.forEach(function (key) {
            delete queryCollection[key];
        });

        return serialize(queryCollection);
    }

    // Expose utility functions via application namespace
    WinJS.Namespace.define("BingApp.Utilities.QueryString", {
        parse: parse,
        serialize: serialize,
        remove: remove
    });
})();
