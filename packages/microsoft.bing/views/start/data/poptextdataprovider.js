/// <reference path="//Microsoft.WinJS.1.0/js/base.js" />
/// <reference path="../../../common/js/tracing.js" />
/// <reference path="../../../common/js/utilities.js" />
/// <reference path="../../../common/js/errors.js" />

(function () {
    "use strict";

    var POP_TEXT_IDENTITY = "bingsearch://data/poptext";
    var POP_TEXT_COUNT = 8;
    // Tag name for items in visual and text popular now feed
    var ELEMENT_TAG_FOR_VISUAL_AND_TEXT_POP_TRENDS = "Element";
    var RequiredProperties = Object.freeze({
        searchtermactual: true,
        title: true,
        Url: true
    });

    function parsePopTextDocument(responseText) {
        /// <summary>
        /// Parses the text input taken from popular text feed and returns javascript list of news elements
        /// </summary>
        /// <param name="responseText" type="String">
        /// response text from XHR request to popular text feed
        /// </param>
        /// <returns type="Array">
        //// items in a the array will have following format:
        ///     {
        ///         SearchTermActual: "LA Kings"
        ///         SearchTermDisplay: "LA Kings"
        ///         Url: "http://www.bing.com/search?q=LA+Kings&qs=n&sk=&sc=8-11"
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
            BingApp.traceError("PopTextDataProvider.parsePopTextDocument: Input is not valid xml - error name: {0}, error message: {1}", err.name ? err.name : "", err.message ? err.message : "");
            throw (new BingApp.Classes.ErrorArgument("responseText", "response from text popular now is not a valid Xml"));
        }
        var elements = doc.selectNodes("//" + ELEMENT_TAG_FOR_VISUAL_AND_TEXT_POP_TRENDS);
        var count = elements.length;
        var results = [];
        for (var i = 0; i < count; i++) {
            var element = elements[i];
            var data = element.childNodes;
            var singleItem = {};
            var corruptDataElement = false;
            for (var j = 0; j < data.length; j++) {
                var value = data[j];				
				if (value && !value.nodeName) {
				    BingApp.traceInfo("PopTextDataProvider.parsePopTextDocument: element in document is defective: {0}", value);
                    corruptDataElement = true;
                    break;
                }

                var nodeName = value.nodeName;

                if (nodeName === "SearchTermDisplay") {
                    nodeName = "title";
                }
                else if (nodeName === "SearchTermActual") {
                    nodeName = "searchtermactual";
                }

                singleItem[nodeName] = value.innerText;
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

    function getPopTextUrl() {
        /// <summary>
        /// returns url for text popular trends
        /// </summary>
        /// <returns type="String">
        /// string of complete url for text popular trends
        /// </returns>
        return { url: BingApp.locator.env.getDataProviderUrl(BingApp.Classes.TrendingController.trendIds.popularNowText) };
    }

    /// <summary>
    /// Defines class that implements popular now text data provider.
    /// items in a json array from getItems having following format:
    ///     {
    ///         SearchTermActual: "LA Kings"
    ///         SearchTermDisplay: "LA Kings"
    ///         Url: "http://www.bing.com/search?q=LA+Kings&qs=n&sk=&sc=8-11"
    ///     }
    /// </summary>
    WinJS.Namespace.define("BingApp.Classes", {
        PopTextDataProvider: WinJS.Class.derive(
            BingApp.Classes.XhrDataProvider,
            function () {
                if (!(this instanceof BingApp.Classes.PopTextDataProvider)) {
                    BingApp.traceWarning("PopTextDataProvider.ctor: Attempted using PopTextDataProvider ctor as function; redirecting to use 'new PopTextDataProvider()'.");
                    return new BingApp.Classes.PopTextDataProvider();
                }
                BingApp.Classes.XhrDataProvider.call(this, POP_TEXT_IDENTITY, POP_TEXT_COUNT, { urlOptions: getPopTextUrl, parser: parsePopTextDocument });

            })
    });

})();
