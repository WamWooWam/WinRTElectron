/// <reference path="//Microsoft.WinJS.1.0/js/base.js" />
/// <reference path="../../../common/js/tracing.js" />
/// <reference path="../../../common/js/utilities.js" />
/// <reference path="../../../common/js/errors.js" />

(function () {
    "use strict";

    var MSN_TRENDS_IDENTITY = "bingsearch://data/msntrending";
    var MSN_TRENDS_COUNT = 15;
    var RequiredProperties = Object.freeze({
        guid: false,
        link: true,
        pubDate: false,
        title: true
    });


    function parseMsnTrendDocument(responseText) {
        /// <summary>
        /// Parses the text input taken from MSN trends feed and returns javascript list of news elements
        /// </summary>
        /// <param name="responseText" type="String">
        /// response text from XHR request to MSN trends feed
        /// </param>
        /// <returns type="Array">
        /// items in a the array will have following format:
        ///     {
        ///         guid: "http://www.bing.com/search?q=miley+cyrus+billboard+music+awards&form=msnwis",
        ///         link: "http://www.bing.com/search?q=miley+cyrus+billboard+music+awards&form=msnwis",
        ///         pubDate: "Mon, 21 May 2012 18:42:09 GMT",
        ///         title: "Cyrus at Billboards"
        ///     }
        /// </returns>
        if (BingApp.Utilities.isNullOrUndefined(responseText)) {
            throw new BingApp.Classes.ErrorArgumentNullOrUndefined("responseText");
        }
        var doc;
        try {
            doc = new Windows.Data.Xml.Dom.XmlDocument();   // Create an empty document
            doc.loadXml(responseText);              //  Parse text into it
        } catch (err) {
            BingApp.traceError("MsnTreandingDataProvider.parseMsnTrendDocument: Input is not valid xml - error name: {0}, error message: {1}", err.name ? err.name : "", err.message ? err.message : "");
            throw (new BingApp.Classes.ErrorArgument("responseText", "response from msn trends is not a valid Xml"));
        }
        var elements = doc.selectNodes("//item");
        var actualCount = elements.length;
        var results = [];
        for (var i = 0; i < actualCount; i++) {
            var data = elements[i].childNodes;
            var singleItem = {};
            var corruptDataElement = false;
            for (var j = 0; j < data.length; j++) {
                var value = data[j];
                if (value && !value.nodeName) {
				    BingApp.traceInfo("MsnTreandingDataProvider.parseMsnTrendDocument: element in document is defective: {0}", value);
                    corruptDataElement = true;
                    break;
                }
                singleItem[value.nodeName] = value.nodeName === "pubDate" ? ((!value.innerText) ? new Date("") : new Date(value.innerText)) : value.innerText; //returns InvalidDate instance of date if its in null or empty or undefined
            }
            if (!corruptDataElement) {
                for (var property in RequiredProperties) {
                    if (RequiredProperties[property] && !singleItem[property]) {
                        corruptDataElement = true;
                        break;
                    }
                }
            }
            if (corruptDataElement) {
                continue;
            }
            singleItem.type = "text";
            results.push(singleItem);
        }
        return results;
    }

    function getMsnTrendUrl() {
        /// <summary>
        /// returns url for msn trends
        /// </summary>
        /// <returns type="Object">
        /// string of complete url for msn trends
        /// </returns>
        return { url: BingApp.locator.env.getDataProviderUrl(BingApp.Classes.TrendingController.trendIds.msnTrends) };

    }

    /// <summary>
    /// Defines class that implements msn trends data provider.
    /// items in a json array from getItems having following format:
    ///     {
    ///         guid: "http://www.bing.com/search?q=miley+cyrus+billboard+music+awards&form=msnwis",
    ///         link: "http://www.bing.com/search?q=miley+cyrus+billboard+music+awards&form=msnwis",
    ///         pubDate: "Mon, 21 May 2012 18:42:09 GMT",
    ///         title: "Cyrus at Billboards"
    ///     }
    /// </summary>
    WinJS.Namespace.define("BingApp.Classes", {
        MsnTrendingDataProvider: WinJS.Class.derive(
            BingApp.Classes.XhrDataProvider,
            function () {
                if (!(this instanceof BingApp.Classes.MsnTrendingDataProvider)) {
                    BingApp.traceWarning("MsnTrendingDataProvider.ctor: Attempted using MsnTrendingDataProvider ctor as function; redirecting to use 'new MsnTrendingDataProvider()'.");
                    return new BingApp.Classes.MsnTrendingDataProvider();
                }
                BingApp.Classes.XhrDataProvider.call(this, MSN_TRENDS_IDENTITY, MSN_TRENDS_COUNT, { urlOptions: getMsnTrendUrl, parser: parseMsnTrendDocument });

            })
    });


})();